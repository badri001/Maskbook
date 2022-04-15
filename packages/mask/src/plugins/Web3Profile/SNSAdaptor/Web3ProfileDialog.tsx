import { Box, Button, DialogActions, DialogContent, Link, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../locales'
import { useCopyToClipboard } from 'react-use'
import { useState } from 'react'
import { PlatformAvatar } from './PlatformAvatar'
import { InjectedDialog, useSnackbarCallback } from '@masknet/shared'
import { formatPublicKey } from '../utils'
import { Copy } from 'react-feather'
import { Main } from './Main'
import { ImageSetting } from './ImageSetting'
import { usePersonaContext } from './hooks/useNextId'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: 520,
    },
    paperRoot: {
        backgroundImage: 'none',
        '&>h2': {
            height: 30,
            border: `1px solid ${theme.palette.divider}`,
            padding: theme.spacing(1.875, 2.5, 1.875, 2.5),
            marginBottom: 24,
        },
    },
    content: {
        width: 480,
        height: 510,
        maxHeight: 510,
        posotion: 'relative',
        paddingBottom: theme.spacing(3),
    },
    link: {
        color: theme.palette.text.primary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        marginLeft: '4px',
    },
    linkIcon: {
        marginRight: theme.spacing(1),
        color: '#6E767D',
    },
    card: {
        overflow: 'scroll',
    },
    bottomFixed: {
        width: '100%',
        display: 'flex',
        boxShadow: '0px 0px 16px rgba(101, 119, 134, 0.2)',
        padding: '19px 16px',
    },
    actions: {
        padding: '0px !important',
    },
}))

export interface BuyTokenDialogProps extends withClasses<never | 'root'> {
    open: boolean
    onClose(): void
}

enum BodyViewSteps {
    main = 'Web3 Profile',
    image_display = 'Settings',
    image_setting = 'Wallets',
    wallet_setting = 'Add wallet',
    wallet = 'wallet',
}

export function Web3ProfileDialog(props: BuyTokenDialogProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { open, onClose } = props
    const [title, setTitle] = useState('Web3 Profile')
    const [steps, setSteps] = useState(BodyViewSteps.main)
    // const {value} = useAsyncRetry(async()=>{
    //     return usePersonaBoundPlatform
    // },[])

    const { currentPersona } = usePersonaContext()

    console.log({ currentPersona })

    const wallets = [
        {
            type: 'ENS',
            resolvedAddress: '0xe93735Deb30AAa0810DfdA7fb2B0E2115982B1d1',
            label: 'randolphph.eth',
        },
    ]
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            copyToClipboard(currentPersona?.identifier?.compressedPoint)
        },
        [],
        undefined,
        undefined,
        undefined,
        'success',
    )
    const TitleButton = () => {
        let button
        switch (steps) {
            case BodyViewSteps.main:
                button = <></>
                break
            case BodyViewSteps.image_display:
                button = (
                    <Button style={{ marginLeft: 'auto' }} onClick={() => setSteps(BodyViewSteps.wallet_setting)}>
                        Settings
                    </Button>
                )
                break
            case BodyViewSteps.image_setting:
                button = <></>
                break
            case BodyViewSteps.wallet_setting:
                button = <Button style={{ marginLeft: 'auto' }}>Wallets</Button>
                break
        }
        return button
    }
    const handleBack = () => {
        switch (steps) {
            case BodyViewSteps.main:
                return onClose
            case BodyViewSteps.image_display:
                return () => {
                    setSteps(BodyViewSteps.main)
                    setTitle('Web3 Profile')
                }
            case BodyViewSteps.image_setting:
                return () => setSteps(BodyViewSteps.image_display)
            case BodyViewSteps.wallet_setting:
                return () => setSteps(BodyViewSteps.image_setting)
            default:
                return onClose
        }
    }
    return (
        <InjectedDialog
            classes={{ paper: classes.root, dialogContent: classes.content, dialogActions: classes.actions }}
            title={title}
            titleTail={TitleButton()}
            fullWidth={false}
            open={open}
            onClose={handleBack()}>
            <DialogContent className={classes.content}>
                {steps === BodyViewSteps.main && (
                    <Main
                        openImageSetting={(str: string) => {
                            setTitle(str)
                            setSteps(BodyViewSteps.image_display)
                        }}
                        persona={currentPersona}
                    />
                )}
                {steps === BodyViewSteps.image_display && <ImageSetting wallets={wallets} />}
            </DialogContent>
            <DialogActions>
                <div className={classes.bottomFixed}>
                    <PlatformAvatar
                        networkIcon="data:image/png;base64,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"
                        size={36}
                    />
                    <div style={{ marginLeft: '4px' }}>
                        <Typography style={{ fontSize: '14px', fontWeight: '700', display: 'flex' }}>kk</Typography>
                        <Box sx={{ display: 'flex' }}>
                            <Typography style={{ fontSize: '12px', fontWeight: '400', color: '#ACB4C1' }}>
                                {formatPublicKey?.(currentPersona?.identifier?.compressedPoint)}
                            </Typography>
                            <Link
                                className={classes.link}
                                underline="none"
                                component="button"
                                title={t.persona_publick_key_copy()}
                                onClick={onCopy}>
                                <Copy className={classes.linkIcon} size={14} />
                            </Link>
                        </Box>
                    </div>
                </div>
            </DialogActions>
        </InjectedDialog>
    )
}
