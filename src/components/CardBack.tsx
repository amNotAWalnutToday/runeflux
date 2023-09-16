type Props = {
    isLocked?: boolean,
}

export default function CardBack ({isLocked}: Props) {
    return (
        <div className={`card_back card ${isLocked ? "card_fade" : ""}`}>
            <p className="card_back__title" >Runeflux</p>
        </div>
    )
}
