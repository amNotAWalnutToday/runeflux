import CardSchema from "../schemas/cardSchema"
import Card from "./Card"

type Props = {
    cardState: { state: CardSchema, index: number },
    playCard: (card: CardSchema | false, indexInHand: number) => void,
    discardCard: (cardIndex: number) => void,
}

export default function PlayCard({cardState, playCard, discardCard}: Props) {
    return (
        <div className="popup" >
            <Card 
                cardState={cardState}
                position={"SELECT"}
            />
            <div>
                <button 
                    className="menu_link"
                    onClick={() => playCard(cardState.state, cardState.index)}
                >
                    Play Card
                </button>
                <button
                    className="menu_link"
                    onClick={() => discardCard(cardState.index)}
                >
                    Discard Card
                </button>
            </div>
        </div>
    )
}