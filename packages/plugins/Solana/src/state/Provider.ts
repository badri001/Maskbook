import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { ProviderState, Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, getNetworkTypeFromChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'

export class Provider extends ProviderState<ChainId, NetworkType, ProviderType> {
    constructor(override context: Plugin.Shared.SharedContext) {
        const defaultValue = {
            accounts: getEnumAsArray(ProviderType).reduce((accumulator, providerType) => {
                accumulator[providerType.value] = {
                    account: '',
                    chainId: ChainId.Mainnet,
                }
                return accumulator
            }, {} as Record<ProviderType, Web3Plugin.Account<ChainId>>),
            providers: [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce(
                (accumulator, site) => {
                    accumulator[site.value] = ProviderType.Phantom
                    return accumulator
                },
                {} as Record<EnhanceableSite | ExtensionSite, ProviderType>,
            ),
        }

        super(context, defaultValue, {
            isSameAddress,
            getNetworkTypeFromChainId,
        })
    }
}
