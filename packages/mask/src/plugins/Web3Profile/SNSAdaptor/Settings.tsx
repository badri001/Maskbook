import { Button, DialogActions, DialogContent } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../locales'
import { useCopyToClipboard } from 'react-use'
// import { Copy } from 'react-feather'
import { InjectedDialog } from '@masknet/shared'
import { useNetworkDescriptor } from '@masknet/plugin-infra'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '520px !important',
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
    bottomFixed: {
        width: '100%',
        display: 'flex',
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    link: {
        cursor: 'pointer',
        lineHeight: '10px',
        marginTop: 2,
        '&:hover': {
            textDecoration: 'none',
        },
    },
    linkIcon: {
        fill: 'none',
        width: 12,
        height: 12,
        marginLeft: theme.spacing(0.5),
    },
}))

export interface SettingsProps extends withClasses<never | 'root'> {
    onClose(): void
    title: string
}

export function Settings(props: SettingsProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { title, onClose } = props
    // const {value} = useAsyncRetry(async()=>{
    //     return usePersonaBoundPlatform
    // },[])
    const networkDescriptor = useNetworkDescriptor(1)
    const [, copyToClipboard] = useCopyToClipboard()
    // const onCopy = useSnackbarCallback(
    //     async (ev: React.MouseEvent<HTMLAnchorElement>) => {
    //         ev.stopPropagation()
    //         copyToClipboard('0x790116d0685eB197B886DAcAD9C247f785987A4a')
    //     },
    //     [],
    //     undefined,
    //     undefined,
    //     undefined,
    //     t('copy_success_of_wallet_addr'),
    // )

    return (
        <InjectedDialog
            classes={classes.root}
            title={title}
            titleTail={
                <Button size="small" style={{ marginLeft: 'auto' }}>
                    Wallets
                </Button>
            }
            maxWidth="sm"
            fullWidth={false}
            open={Boolean(title)}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                {/* <WalletAssetsCard networkIcon={networkDescriptor.icon} /> */}
            </DialogContent>
            <DialogActions>
                <div className={classes.bottomFixed}>
                    <Button>Cancel</Button>
                    <Button>Confirm</Button>
                </div>
            </DialogActions>
        </InjectedDialog>
    )
}
