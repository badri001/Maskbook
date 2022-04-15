import { useAsyncRetry } from 'react-use'
import { useValueRef } from '@masknet/shared-base-ui'
import { ECKeyIdentifier, Identifier } from '@masknet/shared-base'
import { head } from 'lodash-unified'
import { currentPersonaIdentifier } from '../../../../settings/settings'
import Services from '../../../../extension/service'

export function usePersonaContext() {
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personas, retry } = useAsyncRetry(async () => Services.Identity.queryOwnedPersonaInformation())

    const currentPersona = personas?.find((x) =>
        x.identifier.equals(
            Identifier.fromString(currentIdentifier, ECKeyIdentifier).unwrapOr(head(personas)?.identifier),
        ),
    )

    const otherPersonas = personas?.filter((x) => !x.identifier.equals(currentPersona?.identifier))

    return {
        personas: otherPersonas,
        currentPersona,
    }
}
