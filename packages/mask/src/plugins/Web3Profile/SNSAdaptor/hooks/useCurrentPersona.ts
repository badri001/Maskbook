import { useSubscription } from 'use-subscription'
import { context } from '../context'
export function useCurrentPersona() {
    return useSubscription(context.currentPersona)
}
