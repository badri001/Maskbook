import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import {
    isValidDomain,
    isValidAddress,
    isSameAddress,
    ChainId,
    formatBalance,
    formatCurrency,
    formatEthereumAddress,
    getChainDetailed,
    isChainIdValid,
    NonFungibleAssetProvider,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveChainColor,
    resolveChainFullName,
    resolveChainName,
    resolveCollectibleLink,
    resolveTransactionLinkOnExplorer,
    resolveDomainLink,
    formatDomainName,
    ProviderType,
    NetworkType,
    getAverageBlockDelay,
    getDefaultChainId,
    resolveProviderName,
    resolveProviderHomeLink,
    resolveProviderShortenLink,
    resolveProviderDownloadLink,
    resolveNetworkName,
    getChainIdFromNetworkType,
    getNetworkTypeFromChainId,
} from '@masknet/web3-shared-evm'

export class Utils implements Web3Plugin.ObjectCapabilities.Others<ChainId, ProviderType, NetworkType> {
    isChainIdValid = isChainIdValid
    isValidDomain = isValidDomain
    isValidAddress = isValidAddress
    isSameAddress = isSameAddress

    getDefaultChainId = getDefaultChainId
    getChainDetailed = getChainDetailed
    getAverageBlockDelay = getAverageBlockDelay

    getNetworkTypeFromChainId = getNetworkTypeFromChainId
    getChainIdFromNetworkType = getChainIdFromNetworkType

    formatAddress = formatEthereumAddress
    formatCurrency = formatCurrency
    formatBalance = formatBalance
    formatDomainName = formatDomainName

    resolveChainName = resolveChainName
    resolveChainFullName = resolveChainFullName
    resolveChainColor = resolveChainColor
    resolveNetworkName = resolveNetworkName
    resolveProviderName = resolveProviderName
    resolveProviderHomeLink = resolveProviderHomeLink
    resolveProviderShortenLink = resolveProviderShortenLink
    resolveProviderDownloadLink = resolveProviderDownloadLink

    resolveAddressLink = resolveAddressLinkOnExplorer
    resolveBlockLink = resolveBlockLinkOnExplorer
    resolveTransactionLink = resolveTransactionLinkOnExplorer
    resolveDomainLink = resolveDomainLink

    resolveFungibleTokenLink = resolveAddressLinkOnExplorer
    resolveNonFungibleTokenLink = (chainId: ChainId, address: string, tokenId: string) =>
        resolveCollectibleLink(chainId, NonFungibleAssetProvider.OPENSEA, {
            // @ts-ignore
            contractDetailed: { address },
            tokenId,
        })
}
