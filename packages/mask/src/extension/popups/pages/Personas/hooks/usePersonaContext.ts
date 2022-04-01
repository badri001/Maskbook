import { createContainer } from 'unstated-next'
import { useValueRef } from '@masknet/shared-base-ui'
import { ECKeyIdentifier, Identifier, PersonaInformation } from '@masknet/shared-base'
import { currentPersonaIdentifier } from '../../../../../settings/settings'
import { useAsyncRetry } from 'react-use'
import Services from '../../../../service'
import { head } from 'lodash-unified'
import { useEffect, useState } from 'react'
import { MaskMessages } from '../../../../../utils'
import type { ProfileInformationWithNextID } from '../../../../background-script/IdentityService'

export const initData: {
    currentIdentifier?: string
    personas?: PersonaInformation[]
    profiles?: ProfileInformationWithNextID[]
} = {}
function usePersonaContext() {
    const [deletingPersona, setDeletingPersona] = useState<PersonaInformation>()

    let currentIdentifier = useValueRef(currentPersonaIdentifier)
    if (!currentPersonaIdentifier.ready && initData.currentIdentifier) currentIdentifier = initData.currentIdentifier

    const { value: personas = initData.personas, retry } = useAsyncRetry(Services.Identity.queryOwnedPersonaInformation)
    useEffect(() => {
        return MaskMessages.events.ownPersonaChanged.on(retry)
    }, [retry])

    const currentPersona = personas?.find((x) =>
        x.identifier.equals(
            Identifier.fromString(currentIdentifier, ECKeyIdentifier).unwrapOr(head(personas)?.identifier),
        ),
    )

    const otherPersonas = personas?.filter((x) => !x.identifier.equals(currentPersona?.identifier))

    return {
        deletingPersona,
        setDeletingPersona,
        personas: otherPersonas,
        currentPersona,
    }
}

export const PersonaContext = createContainer(usePersonaContext)
