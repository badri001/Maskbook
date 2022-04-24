import { LinkOutIcon } from '@masknet/icons'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { Transaction } from '@masknet/web3-shared-evm'
import { ChainId, DebankTransactionDirection, ZerionTransactionDirection } from '@masknet/web3-shared-evm'
import { Box, Link, Stack, TableCell, TableRow, Typography } from '@mui/material'
import classNames from 'classnames'
import formatDateTime from 'date-fns/format'
import { memo } from 'react'
import { TransactionIcon } from '../TransactionIcon'

const useStyles = makeStyles()((theme) => ({
    type: {
        maxWidth: '240px',
        textOverflow: 'ellipsis',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    cell: {
        padding: `${theme.spacing(1.25)} ${theme.spacing(2.5)}`,
        border: 'none',
        fontSize: theme.typography.pxToRem(14),
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 21,
        color: MaskColorVar.textPrimary,
    },
    linkIcon: {
        fill: 'none',
        fontSize: 16,
        marginLeft: 10,
    },
    pair: {
        color: MaskColorVar.greenMain,
    },
    send: {
        color: MaskColorVar.redMain,
    },
    hover: {
        '&:hover': {
            backgroundColor: theme.palette.background.default,
        },
    },
}))

export interface HistoryTableRowProps {
    transaction: Transaction
    selectedChainId: ChainId
}

export const HistoryTableRow = memo<HistoryTableRowProps>(({ transaction, selectedChainId }) => {
    const { value: domain } = useReverseAddress(transaction.toAddress)

    const transactionType = (transaction.type ?? '').replace(/_/g, ' ')

    return (
        <HistoryTableRowUI
            transaction={transaction}
            formattedType={transactionType}
            selectedChainId={selectedChainId}
            domain={domain}
        />
    )
})

export interface HistoryTableRowUIProps extends HistoryTableRowProps {
    selectedChainId: ChainId
    formattedType: string
    domain?: string
}

export const HistoryTableRowUI = memo<HistoryTableRowUIProps>(
    ({ transaction, selectedChainId, formattedType, domain }) => {
        const { classes } = useStyles()
        const { Utils } = useWeb3State()
        return (
            <TableRow className={classes.hover}>
                <TableCell className={classes.cell} align="center" variant="body">
                    <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <TransactionIcon
                            transactionType={transaction.transactionType}
                            type={transaction.type}
                            address={transaction.toAddress}
                            failed={transaction.failed}
                        />
                        <Stack pl={2}>
                            <Typography textAlign="left" className={classes.type} variant="body2">
                                {formattedType}
                            </Typography>
                            <Typography fontSize={12} textAlign="left" color={MaskColorVar.textSecondary}>
                                {formatDateTime(transaction.timeAt, 'yyyy-MM-dd HH:mm')}
                            </Typography>
                        </Stack>
                    </Box>
                </TableCell>
                <TableCell className={classes.cell} align="center">
                    {transaction.pairs.map((pair, index) => {
                        const direction =
                            pair.direction === DebankTransactionDirection.SEND ||
                            pair.direction === ZerionTransactionDirection.OUT
                        return (
                            <Stack
                                key={index}
                                className={classNames(classes.pair, { [classes.send]: direction })}
                                justifyContent="center"
                                gap={2}
                                direction="row">
                                <Box width="50%" flexGrow={0} flexShrink={0} textAlign="right">
                                    <span>{direction ? '-' : '+'}</span>
                                    <span>{pair.amount.toFixed(pair.amount < 1 ? 6 : 2)}</span>
                                </Box>
                                <Box width="50%" flexGrow={0} flexShrink={0} textAlign="left">
                                    <Typography variant="body2" color={MaskColorVar.textPrimary}>
                                        {pair.symbol}
                                    </Typography>
                                </Box>
                            </Stack>
                        )
                    })}
                </TableCell>
                <TableCell className={classes.cell} align="center">
                    <Box className={classes.link}>
                        <Typography variant="body2">
                            {domain
                                ? Utils?.formatDomainName?.(domain)
                                : Utils?.formatAddress?.(transaction.toAddress, 4)}
                        </Typography>
                        <Link
                            sx={{ height: 21 }}
                            href={Utils?.resolveTransactionLink?.(selectedChainId, transaction.id)}
                            target="_blank"
                            rel="noopener noreferrer">
                            <LinkOutIcon className={classes.linkIcon} />
                        </Link>
                    </Box>
                </TableCell>
            </TableRow>
        )
    },
)
