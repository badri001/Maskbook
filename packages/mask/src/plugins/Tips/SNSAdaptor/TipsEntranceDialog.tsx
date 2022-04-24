import { PluginId } from '@masknet/plugin-infra'
import { useActivatedPlugin } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { InjectedDialog, LoadingAnimation } from '@masknet/shared'
import {
    BindingProof,
    ECKeyIdentifier,
    NextIDAction,
    NextIDStorageInfo,
    NextIDStoragePayload,
} from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { useAccount } from '@masknet/web3-shared-evm'
import { LoadingButton } from '@mui/lab'
import { Button, ButtonProps, DialogContent } from '@mui/material'
import formatDateTime from 'date-fns/format'
import { cloneDeep } from 'lodash-unified'
import { FC, useCallback, useMemo, useState } from 'react'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import Services from '../../../extension/service'
import { useI18N } from '../../../utils'
import { getKvPayload, setKvPatchData, useKvGet } from '../hooks/useKv'
import { useTipsWalletsList } from '../hooks/useTipsWalletsList'
import { useProvedWallets } from '../hooks/useProvedWallets'
import AddWalletView from './bodyViews/AddWallet'
import SettingView from './bodyViews/Setting'
import WalletsView from './bodyViews/Wallets'
import { EmptyStatus } from './components/EmptyStatus'
import { VerifyAlertLine } from './components/VerifyAlertLine'
import { WalletsByNetwork } from './components/WalletsByNetwork'
export interface TipsEntranceDialogProps {
    open: boolean
    onClose: () => void
}
const useStyles = makeStyles()((theme) => ({
    walletBtn: {
        fontSize: '14px',
    },
    alertBox: {
        marginBottom: '20px',
    },
    actions: {
        position: 'absolute',
        bottom: 16,
        width: 'calc( 100% - 32px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(1.5),
    },
    dialogContent: {
        height: 600,
        position: 'relative',
        boxSizing: 'border-box',
    },
    btnContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row-reverse',
    },
    loading: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
    },
}))

enum BodyViewStep {
    Main = 'Tips',
    Setting = 'Settings',
    Wallets = 'Wallets',
    AddWallet = 'Add Wallet',
}

interface WalletButtonProps extends ButtonProps {
    step: BodyViewStep
}

const WalletButton: FC<WalletButtonProps> = ({ step, onClick }) => {
    const { classes } = useStyles()
    if (step === BodyViewStep.AddWallet) return null
    return (
        <div className={classes.btnContainer}>
            <Button onClick={onClick} className={classes.walletBtn} variant="contained" size="small">
                {step === BodyViewStep.Wallets ? BodyViewStep.AddWallet : BodyViewStep.Wallets}
            </Button>
        </div>
    )
}

export function TipsEntranceDialog({ open, onClose }: TipsEntranceDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [showAlert, setShowAlert] = useState(true)
    const [bodyViewStep, setBodyViewStep] = useState<BodyViewStep>(BodyViewStep.Main)
    const [hasChanged, setHasChanged] = useState(false)
    const [rawPatchData, setRawPatchData] = useState<BindingProof[]>([])
    const [rawWalletList, setRawWalletList] = useState<BindingProof[]>([])
    const supportedNetworks = useActivatedPlugin(PluginId.Tips, 'any')?.enableRequirement?.web3?.[
        NetworkPluginID.PLUGIN_EVM
    ]?.tipsSupportedChains
    const { showSnackbar } = useCustomSnackbar()
    const account = useAccount()
    const nowTime = formatDateTime(new Date(), 'yyyy-MM-dd HH:mm')

    const { value: currentPersonaIdentifier } = useAsyncRetry(() => {
        setShowAlert(true)
        return Services.Settings.getCurrentPersonaIdentifier()
    }, [open])
    const { value: currentPersona } = useAsyncRetry(
        () => Services.Identity.queryPersona(currentPersonaIdentifier as ECKeyIdentifier),
        [currentPersonaIdentifier],
    )
    const clickBack = () => {
        if (bodyViewStep === BodyViewStep.Main) {
            onClose()
        } else {
            setBodyViewStep(BodyViewStep.Main)
        }
    }
    const { value: kv, retry: retryKv } = useKvGet()
    const { loading, value: proofRes, retry: retryProof } = useProvedWallets()
    const list = useTipsWalletsList(
        proofRes as BindingProof[],
        currentPersona?.publicHexKey,
        kv?.val as NextIDStorageInfo,
    )
    useMemo(() => {
        setHasChanged(false)
        setRawPatchData(list)
        setRawWalletList(list)
    }, [proofRes, kv, bodyViewStep])

    const onCancel = () => {
        setRawPatchData(cloneDeep(rawWalletList))
        setHasChanged(false)
    }

    const refresh = () => {
        setBodyViewStep(BodyViewStep.Main)
        retryProof()
        retryKv()
    }
    const titleTail = (
        <WalletButton
            step={bodyViewStep}
            onClick={() => {
                setBodyViewStep(bodyViewStep === BodyViewStep.Wallets ? BodyViewStep.AddWallet : BodyViewStep.Wallets)
            }}
        />
    )
    const setAsDefault = (idx: number) => {
        const changed = cloneDeep(rawPatchData)
        changed.forEach((x: any) => (x.isDefault = 0))
        changed[idx].isDefault = 1
        const defaultItem = changed[idx]
        changed.splice(idx, 1)
        changed.sort((a, b) => Number.parseInt(b.last_checked_at, 10) - Number.parseInt(a.last_checked_at, 10))
        changed.unshift(defaultItem)
        setRawPatchData(changed)
        setHasChanged(true)
    }

    const onSwitchChange = (idx: number, v: boolean) => {
        const changed = cloneDeep(rawPatchData)
        changed[idx].isPublic = v ? 1 : 0
        setRawPatchData(changed)
        setHasChanged(true)
    }

    const [kvFetchState, onConfirm] = useAsyncFn(async () => {
        try {
            const payload = await getKvPayload(rawPatchData)
            if (!payload || !payload.val) throw new Error('payload error')
            const signResult = await Services.Identity.generateSignResult(
                currentPersonaIdentifier as ECKeyIdentifier,
                (payload.val as NextIDStoragePayload).signPayload,
            )
            if (!signResult) throw new Error('sign error')
            await setKvPatchData(payload.val, signResult.signature.signature, rawPatchData)
            showSnackbar('Persona signed successfully.', {
                variant: 'success',
                message: nowTime,
            })
            retryProof()
            retryKv()
            return true
        } catch (error) {
            showSnackbar('Persona Signature failed.', {
                variant: 'error',
                message: nowTime,
            })
            return false
        }
    }, [hasChanged, rawPatchData])
    const { setDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnectWalletClick = useCallback(() => {
        if (account) {
            setBodyViewStep(BodyViewStep.AddWallet)
        } else {
            setDialog({
                open: true,
                pluginID: NetworkPluginID.PLUGIN_EVM,
            })
            WalletMessages.events.walletsUpdated.on(() => {
                setBodyViewStep(BodyViewStep.AddWallet)
            })
        }
    }, [account])
    const [confirmState, onConfirmRelease] = useAsyncFn(
        async (wallet: BindingProof | undefined) => {
            try {
                if (!currentPersona?.publicHexKey || !wallet) throw new Error('create payload error')

                const result = await NextIDProof.createPersonaPayload(
                    currentPersona.publicHexKey,
                    NextIDAction.Delete,
                    wallet.identity,
                    wallet.platform,
                )
                if (!result) throw new Error('payload error')

                const signature = await Services.Identity.generateSignResult(
                    currentPersona.identifier,
                    result.signPayload,
                )

                if (!signature) throw new Error('sign error')
                await NextIDProof.bindProof(
                    result.uuid,
                    currentPersona.publicHexKey,
                    NextIDAction.Delete,
                    wallet.platform,
                    wallet.identity,
                    result.createdAt,
                    { signature: signature.signature.signature },
                )
                retryProof()
                retryKv()
                return true
            } catch (error) {
                showSnackbar('Persona Signature failed.', {
                    variant: 'error',
                    message: nowTime,
                })
                return false
            }
        },
        [currentPersona],
    )

    return (
        <InjectedDialog open={open} onClose={clickBack} title={bodyViewStep} titleTail={titleTail}>
            {loading ? (
                <DialogContent className={classes.dialogContent}>
                    <div className={classes.loading}>
                        <LoadingAnimation />
                    </div>
                </DialogContent>
            ) : (
                <DialogContent className={classes.dialogContent}>
                    {showAlert && bodyViewStep === BodyViewStep.Main && (
                        <div className={classes.alertBox}>
                            <VerifyAlertLine onClose={() => setShowAlert(false)} />
                        </div>
                    )}

                    {bodyViewStep === BodyViewStep.Main && rawPatchData.length > 0 ? (
                        <div>
                            {supportedNetworks?.map((x, idx) => {
                                return (
                                    <WalletsByNetwork
                                        wallets={rawPatchData}
                                        toSetting={() => setBodyViewStep(BodyViewStep.Setting)}
                                        key={idx}
                                        network={x}
                                        setAsDefault={setAsDefault}
                                    />
                                )
                            })}
                        </div>
                    ) : bodyViewStep === BodyViewStep.Main && rawPatchData.length === 0 ? (
                        <EmptyStatus toAdd={onConnectWalletClick} />
                    ) : null}

                    {bodyViewStep === BodyViewStep.Setting && (
                        <SettingView onSwitchChange={onSwitchChange} wallets={rawPatchData} />
                    )}
                    {bodyViewStep === BodyViewStep.Wallets && (
                        <WalletsView
                            personaName={currentPersona?.nickname}
                            releaseLoading={confirmState.loading}
                            onRelease={(wallet) => onConfirmRelease(wallet)}
                            wallets={rawPatchData}
                        />
                    )}
                    {bodyViewStep === BodyViewStep.AddWallet && (
                        <AddWalletView onCancel={refresh} bindings={rawWalletList} currentPersona={currentPersona} />
                    )}

                    {![BodyViewStep.AddWallet, BodyViewStep.Wallets].includes(bodyViewStep) && rawPatchData.length > 0 && (
                        <div className={classes.actions}>
                            <ActionButton
                                fullWidth
                                variant="outlined"
                                color="secondary"
                                disabled={!hasChanged}
                                onClick={onCancel}>
                                {t('cancel')}
                            </ActionButton>
                            <LoadingButton
                                color="primary"
                                variant="contained"
                                size="large"
                                loading={kvFetchState.loading}
                                fullWidth
                                disabled={!hasChanged}
                                onClick={onConfirm}>
                                {t('confirm')}
                            </LoadingButton>
                        </div>
                    )}
                </DialogContent>
            )}
        </InjectedDialog>
    )
}
