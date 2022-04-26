import type { RequestArguments } from "web3-core";
import type { EIP1193Provider } from "../types";

export function createEIP1193Provider(
    request: <T>(requestArguments: RequestArguments) => Promise<T>,
): EIP1193Provider {
    return {
        // @ts-ignore
        on: noop,
        // @ts-ignore
        removeListener: noop,
        request,
    }
}
