import type { BigNumber } from 'bignumber.js'
import type { Subscription } from 'use-subscription'
import type { Emitter } from '@servie/events'
import type { EnhanceableSite } from '@masknet/shared-base'
import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type { Plugin } from './types'

export type Color =
    | `rgb(${number}, ${number}, ${number})`
    | `rgba(${number}, ${number}, ${number}, ${number})`
    | `#${string}${string}${string}${string}${string}${string}`
    | `#${string}${string}${string}`
    | `hsl(${number}, ${number}%, ${number}%)`

export interface Pagination {
    /** The item size of each page. */
    size?: number
    /** The page index. */
    page?: number
}

export interface Pageable<T> {
    currentPage: number
    hasNextPage: boolean
    data: T[]
}

export enum NetworkPluginID {
    PLUGIN_EVM = 'com.mask.evm',
    PLUGIN_FLOW = 'com.mask.flow',
    PLUGIN_SOLANA = 'com.mask.solana',
}

export enum CurrencyType {
    NATIVE = 'native',
    BTC = 'btc',
    USD = 'usd',
}

export enum TokenType {
    Fungible = 'Fungible',
    NonFungible = 'NonFungible',
}

export enum TransactionStatusType {
    NOT_DEPEND = 0,
    SUCCEED = 1,
    FAILED = 2,
}

export enum TransactionDescriptorType {
    /** Transfer on chain value. */
    TRANSFER = 'transfer',
    /** A transaction to operate state mutations. */
    INTERACTION = 'interaction',
    /** A transaction to depoly programs. */
    DEPLOYMENT = 'deployment',
    /** A transaction to cancel a previous transaction. */
    CANCEL = 'cancel',
    /** A transaction to modify a previous trasnaction. */
    RETRY = 'retry', // speed up
}

export declare namespace Web3Plugin {
    /**
     * Plugin can declare what chain it supports to trigger side effects (e.g. create a new transaction).
     * When the current chain is not supported, the composition entry will be hidden.
     */
    export type EnableRequirement = Partial<
        Record<
            NetworkPluginID,
            {
                supportedChainIds?: number[]
            }
        >
    >

    export interface NetworkDescriptor<ChainId, NetworkType> {
        /** An unique ID for each network */
        ID: string
        /** The ID of a plugin that provides the functionality of this network. */
        networkSupporterPluginID: NetworkPluginID
        /** The chain id */
        chainId: ChainId
        /** The network type */
        type: NetworkType
        /** The network icon */
        icon: URL
        /** The network icon in fixed color */
        iconColor: Color
        /** The network name */
        name: string
        /** Is a mainnet network */
        isMainnet: boolean
    }

    export interface ProviderDescriptor<ChainId, ProviderType> {
        /** An unique ID for each wallet provider */
        ID: string
        /** The ID of a plugin that provides the adoption of this provider. */
        providerAdaptorPluginID: NetworkPluginID
        /** The provider type */
        type: ProviderType
        /** The provider icon */
        icon: URL
        /** The provider name */
        name: string
        /** Enable requirements */
        enableRequirements?: {
            supportedChainIds?: ChainId[]
            supportedSNSIds?: EnhanceableSite[]
        }
    }

    export interface ApplicationCategoryDescriptor {
        /** An unique ID for each category */
        ID: string
        /** The category icon */
        icon: URL
        /** The category name */
        name: string
    }

    export type GasPrice = Record<
        'fast' | 'normal' | 'slow',
        {
            price: number
            estimatedSeconds: number
        }
    >

    export interface CryptoPrices {
        [token: string]: {
            [key in CurrencyType]?: number
        }
    }

    export interface ChainDetailed<ChainId> {
        name: string
        chainId: ChainId
        fullName?: string
        shortName?: string
        chainName?: string
        network?: 'mainnet' | Omit<string, 'mainnet'>
    }
    export interface ConnectionOptions<ChainId, ProviderType, Transaction> {
        /** Designate the sub-network id of the transaction. */
        chainId?: ChainId
        /** Designate the signer of the transaction. */
        account?: string
        /** Designate the provider to handle the transaction. */
        providerType?: ProviderType
        /** Handle on popups page. */
        popupsWindow?: boolean
        /** Fragments to merge into the transaction. */
        overrides?: Partial<Transaction>
    }
    export interface TransactionDescriptor<Transaction> {
        type: TransactionDescriptorType
        /** a transaction title. */
        title: string
        /** a human-readable description. */
        description?: string
        /** The original transaction object */
        _tx: Transaction
    }
    export interface TransactionContext<ChainId, Parameter = string | undefined> {
        /** the descriptor type */
        type: TransactionDescriptorType
        /** chain id */
        chainId: ChainId
        /** the from address. */
        from: string
        /** the to address */
        to: string
        /** the value amount (polyfill to 0x0 if absent in the original transaction) */
        value: string
        /** code to depoly */
        code?: string
        /** method name */
        name?: string
        /** acutal parameters */
        parameters?: {
            [key: string]: Parameter
        }
    }
    export interface Wallet {
        id: string
        /** User define wallet name. Default address.prefix(6) */
        name: string
        /** The address of wallet */
        address: string
        /** true: Mask Wallet, false: External Wallet */
        hasStoredKeyInfo: boolean
        /** true: Derivable Wallet. false: UnDerivable Wallet */
        hasDerivationPath: boolean
        /** yep: removable, nope: unremovable */
        configurable?: boolean
        /** the derivation path when wallet was created */
        derivationPath?: string
        /** the derivation path when wallet last was derived */
        latestDerivationPath?: string
        /** the internal presentation of mask wallet sdk */
        storedKeyInfo?: api.IStoredKeyInfo
        /** the Mask SDK stored key info */
        /** record created at */
        createdAt: Date
        /** record updated at */
        updatedAt: Date
    }
    export interface AddressName {
        id: string
        /** eg. vitalik.eth */
        label: string
        /** eg. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 */
        ownerAddress: string
        /** eg. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 */
        resolvedAddress?: string
    }
    export interface Transaction<ChainId, SchemaType> {
        id: string
        type?: string
        filterType?: string
        from: string
        to: string
        /** unix timestamp */
        timestamp: number
        /** 0: failed 1: succeed */
        status: 0 | 1
        /** transferred tokens */
        tokens: (Token<ChainId, SchemaType> & {
            amount: string
            direction: string
        })[]
        /** estimated tx fee */
        fee?: {
            [key in CurrencyType]?: string
        }
    }
    export interface RecentTransaction {
        id: string
        chainId: number
        /** status type */
        status: TransactionStatusType
        /** record created at */
        createdAt: Date
        /** record updated at */
        updatedAt: Date
    }
    export interface Identity {
        address: string
        nickname?: string
        avatarURL?: string
        link?: string
    }
    export interface Token<ChainId, SchemaType> {
        id: string
        chainId: ChainId
        type: TokenType
        schema: SchemaType
        address: string
    }
    export interface FungibleToken<ChainId, SchemaType> extends Token<ChainId, SchemaType> {
        decimals?: number
        name: string
        symbol: string
        logoURI?: string | string[]
    }
    export interface NonFungibleToken<ChainId, SchemaType> extends Token<ChainId, SchemaType> {
        tokenId: string
        metadata?: {
            name?: string
            symbol?: string
            description?: string
            tokenURI?: string
            mediaURL?: string
            imageURL?: string
            mediaType?: string
        }
        contract?: {
            /** a type for casting later */
            type: string | number
            chainId: number
            address: string
            name: string
            symbol: string
            baseURI?: string
            iconURL?: string
            balance?: number
        }
        collection?: {
            name: string
            slug: string
            description?: string
            iconURL?: string
            /** verified by provider */
            verified?: boolean
            /** unix timestamp */
            createdAt?: number
        }
    }
    /**
     * A fungible token but with more metadata
     */
    export interface FungibleAsset<ChainId, SchemaType> extends FungibleToken<ChainId, SchemaType> {
        /** currently balance */
        balance: string
        /** estimated price */
        price?: {
            [key in CurrencyType]?: string
        }
        /** estimated value */
        value?: {
            [key in CurrencyType]?: string
        }
    }

    /**
     * A non-fungible token but with more metadata
     */
    export interface NonFungibleAsset<ChainId, SchemaType> extends NonFungibleToken<ChainId, SchemaType> {
        /** the creator data */
        creator?: Identity
        /** the owner data */
        owner?: Identity
        /** estimated price */
        price?: {
            [key in CurrencyType]?: string
        }
        /** traits of the digital asset */
        traits?: {
            type?: string
            value?: string
        }[]
        /** token on auction */
        auction?: {
            isAuction: boolean
            /** unix timestamp */
            startAt?: number
            /** unix timestamp */
            endAt?: number
            /** tokens available to make an order */
            orderTokens?: FungibleToken<ChainId, SchemaType>[]
            /** tokens available to make an offer */
            offerTokens?: FungibleToken<ChainId, SchemaType>[]
        }
        orders?: {
            quantity: number
            /** buy or sell */
            side?: string | number
            /** the account make the order */
            maker?: Identity
            /** the account fullfil the order */
            taker?: Identity
            /** unix timestamp */
            createdAt?: number
            /** unix timestamp */
            expiredAt?: number
            /** current price */
            price?: {
                [key in CurrencyType]?: string
            }
            paymentToken?: FungibleToken<ChainId, SchemaType>
        }[]
        events?: {
            type: string
            /** unix timestamp */
            timestamp: number
            /** relate token price */
            price?: {
                [key in CurrencyType]?: string
            }
            paymentToken?: FungibleToken<ChainId, SchemaType>
        }[]
    }

    export interface TokenList<ChainId, SchemaType> {
        name: string
        description?: string
        /** fungile or non-fungile tokens */
        tokens: Token<ChainId, SchemaType>[]
    }

    export interface Account<ChainId> {
        account: string
        chainId: ChainId
    }

    export interface ProviderEvents<ChainId> {
        /** Emit when the chain id changed. */
        chainId: [string]
        /** Emit when the accounts changed. */
        accounts: [string[]]
        /** Emit when the site connects with a provider. */
        connect: [Web3Plugin.Account<ChainId>]
        /** Emit when the site discconect with a provider. */
        discconect: []
    }
    export interface WatchEvents {
        /** Emit whne the watched transaction status updated. */
        progress: [string, TransactionStatusType]
    }
    export interface WalletProvider<ChainId, Web3Provider, Web3> {
        emitter: Emitter<ProviderEvents<ChainId>>

        /** Get to know whether the provider is ready. */
        readonly ready: boolean
        /** Keep waiting until the provider is ready. */
        readonly readyPromise: Promise<void>
        /** Switch to the designate chain. */
        switchChain(chainId?: ChainId): Promise<void>
        /** Create an web3 instance. */
        createWeb3(chainId?: ChainId): Promise<Web3>
        /** Create an provider instance. */
        createWeb3Provider(chainId?: ChainId): Promise<Web3Provider>
        /** Create the connection. */
        connect(chainId?: ChainId): Promise<Web3Plugin.Account<ChainId>>
        /** Dismiss the connection. */
        disconnect(): Promise<void>
    }
    export interface TransactionChecker<ChainId> {
        checkStatus(chainId: ChainId, id: string): Promise<TransactionStatusType>
    }
    export interface Connection<
        ChainId,
        SchemaType,
        ProviderType,
        Signature,
        Transaction,
        TransactionDetailed,
        TransactionSignature,
        Web3,
        Web3ConnectionOptions = ConnectionOptions<ChainId, ProviderType, Transaction>,
    > {
        /** Get a fungible token. */
        getFungileToken(address: string, options?: Web3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>>
        /** Get an non-fungile token. */
        getNonFungileToken(
            address: string,
            id: string,
            options?: Web3ConnectionOptions,
        ): Promise<FungibleToken<ChainId, SchemaType>>
        /** Get web3 client instance. */
        getWeb3(options?: Web3ConnectionOptions): Promise<Web3>
        /** Get the currently connected account. */
        getAccount(options?: Web3ConnectionOptions): Promise<string>
        /** Get the currently chain id. */
        getChainId(options?: Web3ConnectionOptions): Promise<ChainId>
        /** Get the latest block number. */
        getBlockNumber(options?: Web3ConnectionOptions): Promise<number>
        /** Get the latest balance of the account. */
        getBalance(address: string, options?: Web3ConnectionOptions): Promise<string>
        /** Get the detailed of transaction by id. */
        getTransaction(id: string, options?: Web3ConnectionOptions): Promise<TransactionDetailed | null>
        /** Get the latest transaction status. */
        getTransactionStatus(id: string, options?: Web3ConnectionOptions): Promise<TransactionStatusType>
        /** Get the latest transaction nonce. */
        getTransactionNonce(address: string, options?: Web3ConnectionOptions): Promise<number>
        /** Sign message */
        signMessage(dataToSign: string, signType?: string, options?: Web3ConnectionOptions): Promise<Signature>
        /** Verify message */
        verifyMessage(
            dataToVerify: string,
            signature: Signature,
            signType?: string,
            options?: Web3ConnectionOptions,
        ): Promise<boolean>
        /** Sign a transaction */
        signTransaction(transaction: Transaction, options?: Web3ConnectionOptions): Promise<TransactionSignature>
        /** Sign multiple transactions */
        signTransactions(transactions: Transaction[], options?: Web3ConnectionOptions): Promise<TransactionSignature[]>
        /** Query a transaction */
        callTransaction(transaction: Transaction, options?: Web3ConnectionOptions): Promise<string>
        /** Send a transaction and wait for mining */
        sendTransaction(transaction: Transaction, options?: Web3ConnectionOptions): Promise<string>
        /** Send a signed transaction */
        sendSignedTransaction(signature: TransactionSignature, options?: Web3ConnectionOptions): Promise<string>
    }
    export namespace ObjectCapabilities {
        export interface SettingsState {
            /** Is testnets valid */
            allowTestnet?: Subscription<boolean>
            /** The currency of estimated values and prices. */
            currencyType?: Subscription<CurrencyType>
        }
        export interface AddressBookState<ChainId> {
            /** The tracked addresses of currently chosen sub-network */
            addressBook?: Subscription<string[]>

            /** Add an address into address book. */
            addAddress: (chainId: ChainId, address: string) => Promise<void>
            /** Remove an address from address book. */
            removeAddress: (chainId: ChainId, address: string) => Promise<void>
        }
        export interface RiskWarningState {
            /** The tracked confirmation book. */
            confirmationBook?: Subscription<Record<string, boolean>>

            /** Detect if an account is approved the statement */
            isApproved?: (address: string) => Promise<boolean>
            /** Approve statement of designate account */
            approve?: (address: string, pluginID?: string) => Promise<void>
            /** Revoke statement of designate account */
            revoke?: (address: string, pluginID?: string) => Promise<void>
        }
        export interface AssetState<ChainId, SchemaType> {
            /** Get fungible assets of given account. */
            getFungibleAssets?: (
                chainId: ChainId,
                address: string,
                pagination?: Pagination,
            ) => Promise<Pageable<FungibleAsset<ChainId, SchemaType>>>
            /** Get non-fungible assets of given account. */
            getNonFungibleAssets?: (
                chainId: ChainId,
                address: string,
                pagination?: Pagination,
            ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
            /** Get all fungible assets of given account. */
            getAllFungibleAssets?: (
                chainId: ChainId,
                address: string,
            ) => AsyncIterableIterator<FungibleAsset<ChainId, SchemaType>[]>
            /** Get all non-fungible assets of given account. */
            getAllNonFungibleAssets?: (
                chainId: ChainId,
                address: string,
            ) => AsyncIterableIterator<NonFungibleAsset<ChainId, SchemaType>[]>
        }
        export interface NameServiceState<ChainId, DomainBook = Record<string, string>> {
            /** The tracked domains of currently chosen sub-network */
            domainBook?: Subscription<DomainBook>

            /** get address of domain name */
            lookup?: (chainId: ChainId, domain: string) => Promise<string | undefined>
            /** get domain name of address */
            reverse?: (chainId: ChainId, address: string) => Promise<string | undefined>
        }
        export interface GasPriceState {}
        export interface TokenPriceState<ChainId> {
            /** The tracked token prices which stored as address and price pairs. */
            tokenPrices?: Subscription<CryptoPrices>

            /** get price of a token */
            getTokenPrice?: (chainId: ChainId, currency: CurrencyType, id: string) => CryptoPrices[keyof CryptoPrices]
            /** get prices of tokens */
            getTokenPrices?: (chainId: ChainId, currency: CurrencyType, ids: string[]) => CryptoPrices
        }
        export interface TokenListState<ChainId, SchemaType> {
            /** The tracked fungible token list of currently chosen sub-network */
            fungibleTokens?: Subscription<FungibleToken<ChainId, SchemaType>[]>
            /** The tracked non-fungible token list of currently chosen sub-network */
            nonFungibleTokens?: Subscription<NonFungibleToken<ChainId, SchemaType>[]>

            /** Get the fungible token list. */
            getFungibleTokens?: (chainId: ChainId) => Promise<FungibleToken<ChainId, SchemaType>[]>
            /** Get the non-fungible token list. */
            getNonFungibleTokens?: (chainId: ChainId) => Promise<NonFungibleToken<ChainId, SchemaType>[]>
        }
        export interface TokenState<ChainId, SchemaType> {
            /** The user added fungible tokens. */
            fungibleTokens?: Subscription<FungibleToken<ChainId, SchemaType>[]>
            /** The user added non-fungible tokens. */
            nonFungibleTokens?: Subscription<NonFungibleToken<ChainId, SchemaType>[]>

            /** Add a token */
            addToken?: (token: Token<ChainId, SchemaType>) => Promise<void>
            /** Remove a token */
            removeToken?: (token: Token<ChainId, SchemaType>) => Promise<void>
            /** Unblock a token */
            trustToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
            /** Block a token */
            blockToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
        }
        export interface TransactionState<ChainId, Transaction> {
            /** The tracked transactions of currently chosen sub-network */
            transactions?: Subscription<RecentTransaction[]>

            /** Add a transaction record. */
            addTransaction?: (chainId: ChainId, address: string, id: string, transaction: Transaction) => Promise<void>
            /** Repalce a transaction with new record. */
            replaceTransaction?: (
                chainId: ChainId,
                address: string,
                id: string,
                newId: string,
                transaction: Transaction,
            ) => Promise<void>
            /** Update transaction status. */
            updateTransaction?: (
                chainId: ChainId,
                address: string,
                id: string,
                status: Exclude<TransactionStatusType, TransactionStatusType.NOT_DEPEND>,
            ) => Promise<void>
            /** Remove a transaction record. */
            removeTransaction?: (chainId: ChainId, address: string, id: string) => Promise<void>
            /** Clear all transactions of the account under given chain */
            clearTransactions?: (chainId: ChainId, address: string) => Promise<void>
        }
        export interface TransactionFormatterState<ChainId, Parameters, Transaction> {
            /** Step 1: Create a transaction formatting context. */
            createContext: (
                chainId: ChainId,
                transaction: Transaction,
            ) => Promise<TransactionContext<ChainId, Parameters>>
            /** Step 2: Create a transaction descriptor */
            createDescriptor: (
                chainId: ChainId,
                transaction: Transaction,
                context: TransactionContext<ChainId, Parameters>,
            ) => Promise<TransactionDescriptor<Transaction>>
            /** Elaborate a transaction in a human-readable format. */
            formatTransaction: (
                chainId: ChainId,
                transaction: Transaction,
            ) => Promise<TransactionDescriptor<Transaction>>
        }
        export interface TransactionWatcherState<ChainId, Transaction> {
            emitter: Emitter<WatchEvents>

            /** Add a transaction into the watch list. */
            watchTrasnsaction: (chainId: ChainId, id: string, transaction: Transaction) => void
            /** Remove a transction from the watch list. */
            unwatchTransaction: (chainId: ChainId, id: string) => void
            /** Update transaction status */
            notifyTransaction: (id: string, status: TransactionStatusType) => void
        }
        export interface ExplorerState<ChainId, Transaction> {
            getLatestTransactions: (chainId: ChainId, account: string) => Promise<Transaction[]>
        }
        export interface ProviderState<ChainId, ProviderType, NetworkType> {
            /** The account of the currently visiting site. */
            account?: Subscription<string>
            /** The chain id of the currently visiting site. */
            chainId?: Subscription<ChainId>
            /** The network type of the currently visiting site. */
            networkType?: Subscription<NetworkType>
            /** The provider type of the currently visiting site. */
            providerType?: Subscription<ProviderType>

            /** Detect if a provider is ready */
            isReady: (providerType: ProviderType) => boolean
            /** Wait until a provider ready */
            untilReady: (providerType: ProviderType) => Promise<void>
            /** Connect with the provider and set chain id. */
            connect: (chainId: ChainId, providerType: ProviderType) => Promise<Account<ChainId>>
            /** Discconect with the provider. */
            disconect: (providerType: ProviderType) => Promise<void>
        }
        export interface ProtocolState<
            ChainId,
            SchemaType,
            ProviderType,
            Signature,
            Transaction,
            TransactionDetailed,
            TransactionSignature,
            Web3,
            Web3ConnectionOptions = ConnectionOptions<ChainId, ProviderType, Transaction>,
            Web3Connection = Connection<
                ChainId,
                SchemaType,
                ProviderType,
                Signature,
                Transaction,
                TransactionDetailed,
                TransactionSignature,
                Web3,
                Web3ConnectionOptions
            >,
        > {
            /** Get connection */
            getConnection?: (options?: Web3ConnectionOptions) => Web3Connection | null
            /** Get web3 client */
            getWeb3?: (options?: Web3ConnectionOptions) => Promise<Web3>
            /** Get the current account */
            getAccont?: (options?: Web3ConnectionOptions) => Promise<string>
            /** Get the current chain id */
            getChainId?: (options?: Web3ConnectionOptions) => Promise<ChainId>
            /** Get the latest balance of account */
            getLatestBalance?: (account: string, options?: Web3ConnectionOptions) => Promise<string>
            /** Get the latest block height of chain */
            getLatestBlockNumber?: (options?: Web3ConnectionOptions) => Promise<number>
            /** Get transaction status */
            getTransactionStatus?: (id: string, options?: Web3ConnectionOptions) => Promise<TransactionStatusType>
            /** Switch to sub network */
            switchChain?: (options?: Web3ConnectionOptions) => Promise<void>
            /** Sign a plain message, some chain support multiple sign methods */
            signMessage?: (dataToSign: string, signType?: string, options?: Web3ConnectionOptions) => Promise<Signature>
            /** Verify a signed message */
            verifyMessage?: (
                dataToVerify: string,
                signature: Signature,
                signType?: string,
                options?: Web3ConnectionOptions,
            ) => Promise<boolean>
            /** Query a transaction */
            callTransaction?: (transction: Transaction, options?: Web3ConnectionOptions) => Promise<string>
            /** Sign a transaction, and the result could send as a raw transaction */
            signTransaction?: (
                transaction: Transaction,
                options?: Web3ConnectionOptions,
            ) => Promise<TransactionSignature>
            /** Send transaction and get tx id */
            sendTransaction?: (transaction: Transaction, options?: Web3ConnectionOptions) => Promise<string>
            /** Send raw transaction and get tx id */
            sendSignedTransaction?: (
                transaction: TransactionSignature,
                options?: Web3ConnectionOptions,
            ) => Promise<string>
        }
        export interface WalletState {
            /** The currently stored wallet by MaskWallet. */
            wallets?: Subscription<Wallet[]>
            /** The default derivable wallet. */
            walletPrimary?: Subscription<Wallet | null>

            addWallet?: (id: string, wallet: Web3Plugin.Wallet) => Promise<void>
            removeWallet?: (id: string) => Promise<void>
            getAllWallets?: () => Promise<Wallet[]>
        }
        export interface Others<ChainId, ProviderType, NetworkType> {
            /** detect if a chain id is supported  */
            isChainIdValid(chainId: ChainId, allowTestnet: boolean): boolean
            /** detect if a domain is valid */
            isValidDomain(domain: string): boolean
            /** detect if an address is valid */
            isValidAddress(address: string): boolean
            /** compare two addresses */
            isSameAddress(address?: string, otherAddress?: string): boolean

            /** data formatting */
            formatAddress(address: string, size?: number): string
            formatCurrency(value: BigNumber.Value, sign?: string, symbol?: string): string
            formatBalance(value: BigNumber.Value, decimals?: number, significant?: number): string
            formatDomainName(domain?: string, size?: number): string | undefined

            /** chain customization */
            getDefaultChainId(): ChainId
            getChainDetailed(chainId: ChainId): ChainDetailed<ChainId> | undefined
            getAverageBlockDelay(chainId: ChainId, scale?: number): number
            getNetworkTypeFromChainId(chainId: ChainId): NetworkType | undefined
            getChainIdFromNetworkType(networkType: NetworkType): ChainId

            resolveChainName(chainId: ChainId): string
            resolveChainColor(chainId: ChainId): string
            resolveChainFullName(chainId: ChainId): string
            resolveNetworkName(networkType: NetworkType): string
            resolveProviderName(providerType: ProviderType): string
            resolveProviderHomeLink(providerType: ProviderType): string
            resolveProviderShortenLink(providerType: ProviderType): string
            resolveProviderDownloadLink(providerType: ProviderType): string

            /** explorer */
            resolveAddressLink(chainId: ChainId, address: string): string
            resolveBlockLink(chainId: ChainId, blockNumber: string): string
            resolveTransactionLink(chainId: ChainId, id: string): string
            resolveDomainLink(domain: string): string
            resolveFungibleTokenLink(chainId: ChainId, address: string): string
            resolveNonFungibleTokenLink(chainId: ChainId, address: string, tokenId: string): string
        }
        export interface Capabilities<
            ChainId,
            SchemaType,
            ProviderType,
            NetworkType,
            Signature,
            Transaction,
            TransactionDetailed,
            TransactionSignature,
            TransactionParameter,
            Web3,
        > {
            AddressBook?: AddressBookState<ChainId>
            Asset?: AssetState<ChainId, SchemaType>
            NameService?: NameServiceState<ChainId>
            RiskWarning?: RiskWarningState
            Settings?: SettingsState
            Token?: TokenState<ChainId, SchemaType>
            TokenPrice?: TokenPriceState<ChainId>
            TokenList?: TokenListState<ChainId, SchemaType>
            Transaction?: TransactionState<ChainId, Transaction>
            TransactionFormatter?: TransactionFormatterState<ChainId, TransactionParameter, Transaction>
            TransactionWatcher?: TransactionWatcherState<ChainId, Transaction>
            Protocol?: ProtocolState<
                ChainId,
                SchemaType,
                ProviderType,
                Signature,
                Transaction,
                TransactionDetailed,
                TransactionSignature,
                Web3
            >
            Explorer?: ExplorerState<ChainId, Transaction>
            Provider?: ProviderState<ChainId, ProviderType, NetworkType>
            Wallet?: WalletState
            Utils?: Others<ChainId, ProviderType, NetworkType>
        }
    }
    export namespace UI {
        export interface NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType> {
            network: NetworkDescriptor<ChainId, NetworkType>
            provider?: ProviderDescriptor<ChainId, ProviderType>
            children?: React.ReactNode
            onClick?: (
                network: NetworkDescriptor<ChainId, NetworkType>,
                provider?: ProviderDescriptor<ChainId, ProviderType>,
            ) => void
        }
        export interface ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType> {
            network: NetworkDescriptor<ChainId, NetworkType>
            provider: ProviderDescriptor<ChainId, ProviderType>
            children?: React.ReactNode
            onClick?: (
                network: NetworkDescriptor<ChainId, NetworkType>,
                provider: ProviderDescriptor<ChainId, ProviderType>,
            ) => void
        }
        export interface ApplicationCategoryIconClickBaitProps {
            category: ApplicationCategoryDescriptor
        }
        export interface AddressFormatterProps {
            address: string
            size?: number
        }
        export interface UI<ChainId, ProviderType, NetworkType> {
            SelectNetworkMenu?: {
                /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
                NetworkIconClickBait?: Plugin.InjectUIReact<
                    UI.NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>
                >
            }
            SelectProviderDialog?: {
                /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
                NetworkIconClickBait?: Plugin.InjectUIReact<
                    UI.NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>
                >
                /** This UI will receive provider icon as children component, and the plugin may hook click handle on it. */
                ProviderIconClickBait?: Plugin.InjectUIReact<
                    UI.ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType>
                >
            }
            WalletStatusDialog?: {
                /** This UI will receive application category icon as children component, and the plugin may hook click handle on it. */
                ApplicationCategoryIconClickBait?: Plugin.InjectUIReact<UI.ApplicationCategoryIconClickBaitProps>
            }
        }
    }
}
