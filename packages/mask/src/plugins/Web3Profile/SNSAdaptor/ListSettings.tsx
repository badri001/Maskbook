import { Box, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../locales'
import { useNetworkDescriptor } from '@masknet/plugin-infra'
import type { ERC721ContractDetailed } from '@masknet/web3-shared-evm'
import { ImageIcon } from './ImageIcon'

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
    collectionWrap: {
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        margin: '12px 12px 0 0',
        border: `1px solid ${theme.palette.divider}`,
        background: 'rgba(229,232,235,1)',
        cursor: 'pointer',
    },
    button: {
        width: '234px',
        height: '40px',
    },
}))

export interface ListSettingProps extends withClasses<never | 'root'> {
    onClose(): void
    title: string
    open: boolean
    collections: ERC721ContractDetailed[]
}

export function ListSetting(props: ListSettingProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { title, onClose, open = false, collections } = props
    // const {value} = useAsyncRetry(async()=>{
    //     return usePersonaBoundPlatform
    // },[])
    const networkDescriptor = useNetworkDescriptor(1)

    return (
        <>
            <Typography>Listed</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {collections?.map((collection, i) => (
                    <div key={i} className={classes.collectionWrap}>
                        <ImageIcon size={49} borderRadius="12px" icon={collection?.iconURL} />
                    </div>
                ))}
            </Box>
            <Typography>Unlisted</Typography>
        </>
    )
}
