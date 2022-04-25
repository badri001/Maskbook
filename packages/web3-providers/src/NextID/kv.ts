/**
 * Document url: https://github.com/nextdotid/kv_server/blob/develop/docs/api.apib
 */
import urlcat from 'urlcat'
import type { NextIDStoragePayload, NextIDPlatform } from '@masknet/shared-base'
import { fetchJSON } from './helper'
import type { Result } from 'ts-results'
import type { NextIDBaseAPI } from '../types'
import { KV_BASE_URL_DEV, KV_BASE_URL_PROD } from './constants'

interface CreatePayloadResponse {
    uuid: string
    sign_payload: string
    created_at: string
}

const BASE_URL =
    process.env.channel === 'stable' && process.env.NODE_ENV === 'production' ? KV_BASE_URL_PROD : KV_BASE_URL_DEV

function formatPatchData(pluginId: string, data: unknown) {
    return {
        [pluginId]: data,
    }
}

export class NextIDStorageAPI implements NextIDBaseAPI.Storage {
    /**
     * Get current KV of a persona
     * @param personaPublicKey
     *
     */
    async get<T>(personaPublicKey: string): Promise<Result<T, string>> {
        return fetchJSON(urlcat(BASE_URL, '/v1/kv', { persona: personaPublicKey }))
    }

    /**
     * Get signature payload for updating
     * @param personaPublicKey
     * @param platform
     * @param identity
     * @param patchData
     * @param pluginId
     *
     * We choose [RFC 7396](https://www.rfc-editor.org/rfc/rfc7396) standard for KV modifying.
     */
    async getPayload(
        personaPublicKey: string,
        platform: NextIDPlatform,
        identity: string,
        patchData: unknown,
        pluginId: string,
    ): Promise<Result<NextIDStoragePayload, string>> {
        const requestBody = {
            persona: personaPublicKey,
            platform,
            identity,
            patch: formatPatchData(pluginId, patchData),
        }

        const response = await fetchJSON<CreatePayloadResponse>(urlcat(BASE_URL, '/v1/kv/payload'), {
            body: JSON.stringify(requestBody),
            method: 'POST',
        })

        return response.map((x) => ({
            signPayload: JSON.stringify(JSON.parse(x.sign_payload)),
            createdAt: x.created_at,
            uuid: x.uuid,
        }))
    }

    /**
     * Update a full set of key-value pairs
     * @param uuid
     * @param personaPublicKey
     * @param signature
     * @param platform
     * @param identity
     * @param createdAt
     * @param patchData
     * @param pluginId
     *
     * We choose [RFC 7396](https://www.rfc-editor.org/rfc/rfc7396) standard for KV modifying.
     */
    set<T>(
        uuid: string,
        personaPublicKey: string,
        signature: string,
        platform: NextIDPlatform,
        identity: string,
        createdAt: string,
        patchData: unknown,
        pluginId: string,
    ): Promise<Result<T, string>> {
        const requestBody = {
            uuid,
            persona: personaPublicKey,
            platform,
            identity,
            signature,
            patch: formatPatchData(pluginId, patchData),
            created_at: createdAt,
        }

        return fetchJSON(urlcat(BASE_URL, '/v1/kv'), {
            body: JSON.stringify(requestBody),
            method: 'POST',
        })
    }
}
