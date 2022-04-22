import { makeStyles } from '@masknet/theme'
import { Box, Typography, CircularProgress } from '@mui/material'
import { NFTAvatar } from './NFTAvatar'
import { NFTInfo } from './NFTInfo'
import { MoreIcon } from '../assets/more'
import { RSS3_KEY_SNS } from '../constants'
import { useCheckTokenOwner, useTokenOwner } from '../hooks/useTokenOwner'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import type { TokenInfo } from '../types'
import { useCallback, useEffect, useState } from 'react'
import type { BindingProof } from '@masknet/shared-base'
import { usePersonaNFTAvatar } from '../hooks/usePersonaNFTAvatar'
import { context } from '../context'
import { useSubscription } from 'use-subscription'

const useStyles = makeStyles<{ disabled: boolean }>()((theme, props) => ({
    root: {
        margin: theme.spacing(2, 0.5),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },

    userInfo: {
        fontSize: 14,
        marginLeft: 16,
        flex: 1,
    },
}))

interface PersonaItemProps {
    owner?: boolean
    avatar: string
    userId: string
    proof: BindingProof
    onSelect?: (proof: BindingProof, tokenInfo?: TokenInfo) => void
}

export function PersonaItem(props: PersonaItemProps) {
    const currentIdentity = useSubscription(context.lastRecognizedProfile)
    const { userId, onSelect, owner = false, proof, avatar } = props
    const { classes } = useStyles({ disabled: !owner })
    const { value: _avatar, loading } = usePersonaNFTAvatar(userId, getAvatarId(avatar) ?? '', RSS3_KEY_SNS.TWITTER)
    const { value: token, loading: loadingToken } = useTokenOwner(_avatar?.address ?? '', _avatar?.tokenId ?? '')
    const { loading: loadingCheckOwner, isOwner } = useCheckTokenOwner(token?.owner)
    const [haveNFT, setHaveNFT] = useState(false)

    useEffect(() => {
        if (!currentIdentity) return
        setHaveNFT(
            Boolean(_avatar && token && isOwner && _avatar.avatarId === getAvatarId(currentIdentity?.avatar ?? '')),
        )
    }, [_avatar, token, isOwner, currentIdentity?.avatar])

    const onClick = useCallback(() => {
        onSelect?.(proof, _avatar ? { address: _avatar?.address, tokenId: _avatar?.tokenId } : undefined)
    }, [_avatar, proof])

    return (
        <div className={classes.root} onClick={onClick}>
            <>
                <NFTAvatar owner={owner} avatar={_avatar?.imageUrl} hasBorder={haveNFT} platform={proof.platform} />
                <Box className={classes.userInfo}>
                    <Typography variant="body1" color="textPrimary" fontSize={14} fontWeight={700}>
                        {_avatar?.nickname}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" fontSize={12}>
                        @{userId}
                    </Typography>
                </Box>
                {loading || loadingToken || loadingCheckOwner ? (
                    <CircularProgress size="small" />
                ) : (
                    <NFTInfo
                        owner={isOwner}
                        nft={
                            haveNFT
                                ? {
                                      name: token?.name ?? '',
                                      symbol: token?.symbol ?? '',
                                      tokenId: _avatar?.tokenId ?? '',
                                      address: _avatar?.address ?? '',
                                  }
                                : undefined
                        }
                    />
                )}
                <MoreIcon />
            </>
        </div>
    )
}
