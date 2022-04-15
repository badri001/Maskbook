import { PlatformCard } from './PlatformCard'

export function Main(props) {
    const { persona, openImageSetting } = props
    return (
        <div>
            {persona?.linkedProfiles?.map((identifier) => (
                <PlatformCard
                    openImageSetting={openImageSetting}
                    key={identifier?.identifier?.userId}
                    nickName={identifier?.nickname}
                    platformId={identifier?.identifier?.userId}
                    avatar={identifier?.avatar}
                    isCurrent={identifier?.isCurrent}
                />
            ))}
        </div>
    )
}
