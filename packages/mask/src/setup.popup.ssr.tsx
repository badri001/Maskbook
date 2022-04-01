import { i18NextInstance, EnhanceableSite, PopupRoutes } from '@masknet/shared-base'
import { noop, once } from 'lodash-unified'
import { Appearance, TssCacheProvider } from '@masknet/theme'
import { ThemeProvider, CacheProvider } from '@emotion/react'
import { enUS } from '@mui/material/locale'
import { renderToString } from 'react-dom/server'
import createCache from '@emotion/cache'
import createEmotionServer from '@emotion/server/create-instance'
import { StaticRouter } from 'react-router-dom/server'
import { initReactI18next } from 'react-i18next'
import { addMaskI18N } from '../shared-ui/locales/languages'
import { PopupFrame } from './extension/popups/components/PopupFrame'
import { PersonaHomeUI } from './extension/popups/pages/Personas/Home/UI'
import { useClassicMaskFullPageTheme } from './utils/useClassicMaskFullPageTheme'
import {
    FacebookColoredIcon,
    InstagramColoredIcon,
    MindsIcon,
    TwitterColoredIcon,
    OpenSeaColoredIcon,
} from '@masknet/icons'
import type { PopupSSR_Props } from '../background/tasks/Cancellable/PopupSSR/type'

const init = once(() =>
    i18NextInstance.init().then(() => {
        addMaskI18N(i18NextInstance)
        initReactI18next.init(i18NextInstance)
    }),
)
export async function render(props: PopupSSR_Props) {
    await init()
    const muiCache = createCache({ key: 'mui' })
    const tssCache = createCache({ key: 'tss' })
    const tssServer = createEmotionServer(tssCache)
    const muiServer = createEmotionServer(muiCache)

    const html = renderToString(
        <CacheProvider value={muiCache}>
            <TssCacheProvider value={tssCache}>
                <PopupSSR {...props} />
            </TssCacheProvider>
        </CacheProvider>,
    )
    const muiCSS = muiServer.constructStyleTagsFromChunks(muiServer.extractCriticalToChunks(html))
    const tssCSS = tssServer.constructStyleTagsFromChunks(tssServer.extractCriticalToChunks(html))
    return { html, css: muiCSS + tssCSS }
}

const SOCIAL_MEDIA_ICON_MAPPING: Record<string, React.ReactNode> = {
    [EnhanceableSite.Twitter]: <TwitterColoredIcon />,
    [EnhanceableSite.Facebook]: <FacebookColoredIcon />,
    [EnhanceableSite.Minds]: <MindsIcon />,
    [EnhanceableSite.Instagram]: <InstagramColoredIcon />,
    [EnhanceableSite.OpenSea]: <OpenSeaColoredIcon />,
}
const DEFINED_SITES = [
    EnhanceableSite.Twitter,
    EnhanceableSite.Facebook,
    EnhanceableSite.Minds,
    EnhanceableSite.Instagram,
    EnhanceableSite.OpenSea,
]

function useAlwaysLightTheme() {
    return useClassicMaskFullPageTheme(Appearance.light, [enUS, false])
}
function PopupSSR(props: PopupSSR_Props) {
    const currentPersona = props.personas?.find((x) => x.identifier.equals(props.currentPersona))
    return (
        <StaticRouter location={PopupRoutes.Personas}>
            <ThemeProvider theme={useAlwaysLightTheme}>
                <PopupFrame personaLength={props.personas?.length || 0}>
                    <PersonaHomeUI
                        personas={props.personas}
                        profilesWithNextID={props.profilesWithNextID}
                        currentPersona={currentPersona}
                        confirmLoading={false}
                        SOCIAL_MEDIA_ICON_MAPPING={SOCIAL_MEDIA_ICON_MAPPING}
                        definedSocialNetworks={DEFINED_SITES}
                        onChangeCurrentPersona={noop}
                        onConnectNextID={noop}
                        onConfirmDisconnect={noop}
                        onDeletePersona={noop}
                        onDisconnectProfile={noop}
                        openProfilePage={noop}
                        onConnectProfile={noop}
                    />
                </PopupFrame>
            </ThemeProvider>
        </StaticRouter>
    )
}
