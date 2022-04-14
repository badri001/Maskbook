import { ImageIcon, ReversedAddress } from '@masknet/shared'
import { makeStyles, ShadowRootMenu, useStylesExtends } from '@masknet/theme'
import { formatEthereumAddress, isSameAddress, useChainId } from '@masknet/web3-shared-evm'
import { Button, Divider, Link, ListItemIcon, MenuItem, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { ExternalLink } from 'react-feather'
import { CopyIconButton } from '../../NextID/components/CopyIconButton'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { WalletSettingIcon } from '../assets/setting'
import { CheckedIcon, UncheckIcon } from '../assets/checked'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { NFTWalletConnect } from './WalletConnect'
import { BindingProof, PopupRoutes } from '@masknet/shared-base'
import Services from '../../../extension/service'
import { useNetworkDescriptor, useWeb3State } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()(() => ({
    root: {},
    wrapper: {
        backgroundColor: '#F6F8F8',
        borderRadius: 9999,
        paddingLeft: 8,
        paddingRight: 8,
        cursor: 'pointer',
    },
    address: {},
    copy: {},
    link: {},
    linkIcon: {},
    icon: {
        width: 40,
        height: 40,
    },
}))

interface AddressNamesProps extends withClasses<'root'> {
    onChange: (address: string) => void
    account: string
    wallets: BindingProof[]
}

export function AddressNames(props: AddressNamesProps) {
    const { onChange, account, wallets } = props
    const classes = useStylesExtends(useStyles(), props)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const onClose = () => setAnchorEl(null)
    const onOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)

    const [selectedWallet, setSelectedWallet] = useState(account || wallets?.[0]?.identity || '')
    const onClick = useCallback((address: string) => {
        onChange(address)
        setSelectedWallet(address)
        onClose()
    }, [])

    useEffect(() => {
        if (!account && !wallets?.[0]?.identity) return
        setSelectedWallet(account || wallets?.[0]?.identity)
    }, [account, wallets?.[0]?.identity])

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const chainId = useChainId()
    const openPopupsWindow = useCallback(() => {
        Services.Helper.openPopupWindow(PopupRoutes.SelectWallet, {
            chainId,
            internal: true,
        })
    }, [chainId])

    const onConnectWallet = useCallback(() => {
        openSelectProviderDialog()
        onClose()
    }, [])

    if (!account && !wallets.length) return <NFTWalletConnect />

    return (
        <Stack className={classes.root}>
            <Stack
                onClick={onOpen}
                direction="row"
                alignItems="center"
                justifyContent="center"
                className={classes.wrapper}>
                <WalletUI address={selectedWallet} />
                <ArrowDropDownIcon />
            </Stack>
            <ShadowRootMenu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose} disableRestoreFocus>
                {account ? (
                    <MenuItem key={account} value={account} onClick={() => onClick(account)}>
                        <ListItemIcon>
                            {selectedWallet === account ? (
                                <CheckedIcon className={classes.icon} />
                            ) : (
                                <UncheckIcon className={classes.icon} />
                            )}
                        </ListItemIcon>
                        <WalletUI address={account} />
                        {account && (
                            <Button style={{ marginLeft: 16 }} onClick={onConnectWallet}>
                                Change
                            </Button>
                        )}
                    </MenuItem>
                ) : (
                    <MenuItem key="Connect">
                        <Button fullWidth onClick={onConnectWallet}>
                            Connect your wallet
                        </Button>
                    </MenuItem>
                )}
                {wallets
                    ?.filter((x) => !isSameAddress(x.identity, account))
                    .map((x) => (
                        <MenuItem key={x.identity} value={x.identity} onClick={() => onClick(x.identity)}>
                            <ListItemIcon>
                                {selectedWallet === x.identity ? (
                                    <CheckedIcon className={classes.icon} />
                                ) : (
                                    <UncheckIcon className={classes.icon} />
                                )}
                            </ListItemIcon>
                            <WalletUI address={x.identity} />
                        </MenuItem>
                    ))}
                <Divider />

                <MenuItem
                    key="settings"
                    onClick={() => {
                        openPopupsWindow()
                        onClose()
                    }}>
                    <ListItemIcon>
                        <WalletSettingIcon />
                    </ListItemIcon>
                    Wallet settings
                </MenuItem>
            </ShadowRootMenu>
        </Stack>
    )
}

const useWalletUIStyles = makeStyles()((theme) => ({
    root: {},
    address: {
        fontSize: 10,
    },
    copy: {
        fontSize: 16,
        stroke: theme.palette.text.primary,
        cursor: 'pointer',
    },
    link: {},
    linkIcon: {},
}))

interface WalletUIProps {
    address: string
}

function WalletUI(props: WalletUIProps) {
    const { Utils } = useWeb3State()
    const { address } = props
    const networkDescriptor = useNetworkDescriptor()
    const { classes } = useWalletUIStyles()

    return (
        <Stack direction="row" alignItems="center" justifyContent="center">
            <ImageIcon size={30} icon={networkDescriptor?.icon} />
            <Stack direction="column" sx={{ marginLeft: 0.5 }}>
                <Stack fontSize={14}>
                    <ReversedAddress address={address} />
                </Stack>
                <Stack direction="row" alignItems="center">
                    <Typography className={classes.address}>{formatEthereumAddress(address, 4)}</Typography>
                    <CopyIconButton text={address} className={classes.copy} />
                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(1, address) ?? ''}
                        target="_blank"
                        title="View on Explorer"
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                    </Link>
                </Stack>
            </Stack>
        </Stack>
    )
}
