import { toHex } from 'web3-utils'
import { upperFirst } from 'lodash-unified'
import { createLookupTableResolver } from '@masknet/web3-shared-base'
import CHAINS from '../assets/chains.json'
import { getRPCConstants, getCoinGeckoConstants } from '../constants'
import { ChainId, NetworkType } from '../types'

export function isChainIdValid(chainId: ChainId, allowTestnet = false) {
    const chainDetailed = getChainDetailed(chainId)
    return !!getNetworkTypeFromChainId(chainId) && (chainDetailed?.network === 'mainnet' || allowTestnet)
}

export function isChainIdMainnet(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.network === 'mainnet'
}

export function isEIP1559Supported(chainId: ChainId) {
    const features = getChainDetailed(chainId)?.features ?? []
    return features.includes('EIP1559')
}

export function isFortmaticSupported(chainId: ChainId) {
    return [ChainId.Mainnet, ChainId.BSC].includes(chainId)
}

export function getDefaultChainId() {
    return ChainId.Mainnet
}

export function getChainDetailed(chainId = ChainId.Mainnet) {
    return CHAINS.find((x) => x.chainId === chainId)
}

// Learn more: https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
export function getChainDetailedCAIP(chainId = ChainId.Mainnet) {
    const chainDetailed = getChainDetailed(chainId)
    const { RPC = [] } = getRPCConstants(chainId)
    if (!chainDetailed) return
    return {
        chainId: toHex(chainDetailed.chainId),
        chainName: chainDetailed.name,
        nativeCurrency: chainDetailed.nativeCurrency,
        rpcUrls: RPC,
        blockExplorerUrls: [
            chainDetailed.explorers && chainDetailed.explorers.length > 0 && chainDetailed.explorers[0].url
                ? chainDetailed.explorers[0].url
                : chainDetailed.infoURL,
        ],
    }
}

export function getChainRPC(chainId: ChainId, seed: number) {
    const { RPC, RPC_WEIGHTS } = getRPCConstants(chainId)
    if (!RPC || !RPC_WEIGHTS) throw new Error(`Unknown chain id: ${chainId}.`)
    return RPC[RPC_WEIGHTS[seed]]
}

export function getChainName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.name ?? 'Unknown Network'
}

export function getChainShortName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.shortName ?? 'Unknown Network'
}

export function getChainFullName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.fullName ?? 'Unknown Network'
}

export function getChainIdFromName(name: string) {
    if (!name) return
    const chainDetailed = CHAINS.find((x) =>
        [x.chain, x.network, x.name, x.shortName, x.fullName ?? '']
            .filter(Boolean)
            .map((y) => y.toLowerCase())
            .includes(name.toLowerCase()),
    )
    return chainDetailed && getNetworkTypeFromChainId(chainDetailed.chainId)
        ? (chainDetailed.chainId as ChainId)
        : undefined
}

export const getChainIdFromNetworkType = createLookupTableResolver<NetworkType, ChainId>(
    {
        [NetworkType.Ethereum]: ChainId.Mainnet,
        [NetworkType.Binance]: ChainId.BSC,
        [NetworkType.Polygon]: ChainId.Matic,
        [NetworkType.Arbitrum]: ChainId.Arbitrum,
        [NetworkType.xDai]: ChainId.xDai,
        [NetworkType.Celo]: ChainId.Celo,
        [NetworkType.Fantom]: ChainId.Fantom,
        [NetworkType.Aurora]: ChainId.Aurora,
        [NetworkType.Avalanche]: ChainId.Avalanche,
        [NetworkType.Boba]: ChainId.Boba,
        [NetworkType.Fuse]: ChainId.Fuse,
        [NetworkType.Metis]: ChainId.Metis,
        [NetworkType.Optimistic]: ChainId.Optimistic,
        [NetworkType.Conflux]: ChainId.Conflux,
    },
    ChainId.Mainnet,
)

// The value should be same as chain field in packages/web3-shared/evm/assets/chains.json
const chainNameMap: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: 'ETH',
    [NetworkType.Binance]: 'BNB Chain',
    [NetworkType.Polygon]: 'Polygon',
    [NetworkType.Arbitrum]: 'Arbitrum',
    [NetworkType.xDai]: 'Gnosis',
    [NetworkType.Celo]: 'CELO',
    [NetworkType.Fantom]: 'FTM',
    [NetworkType.Aurora]: 'Aurora',
    [NetworkType.Avalanche]: 'AVAX',
    [NetworkType.Boba]: 'Boba',
    [NetworkType.Fuse]: 'Fuse',
    [NetworkType.Metis]: 'Metis',
    [NetworkType.Optimistic]: 'Optimistic',
    [NetworkType.Conflux]: 'Conflux',
}

export function getNetworkTypeFromChainId(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    const entry = Object.entries(chainNameMap).find(([_, value]) => {
        if (value === chainDetailed?.chain) return true
        return false
    })
    return entry?.[0] as NetworkType | undefined
}
export function getChainFromChainId(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.chain
}

export function getCoinGeckoPlatformId(chainId: ChainId) {
    const { PLATFORM_ID = '' } = getCoinGeckoConstants(chainId)
    return PLATFORM_ID
}

export function getCoinGeckoCoinId(chainId: ChainId) {
    const { COIN_ID = '' } = getCoinGeckoConstants(chainId)
    return COIN_ID
}

export function getNetworkName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return 'Unknown Network'
    if (chainDetailed.networkId === ChainId.Matic) return chainDetailed.fullName
    if (chainDetailed.network === 'mainnet') return chainDetailed.chain
    return upperFirst(chainDetailed.network)
}

export function getAverageBlockDelay(chainId: ChainId, scale = 1) {
    return 15 * 1000 * scale
}
