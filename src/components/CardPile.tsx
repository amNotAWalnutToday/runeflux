import CardSchema from "../schemas/cardSchema"
import MiniCard from "./MiniCard";

type Props = {
    type: string,
    pile: CardSchema[],
    drawSpecificCard: (cardIndex: number, fromDiscard?: boolean, playerId?: string) => void,
    playCard?: (card: CardSchema) => void,
}

export default function CardPile({type, pile, drawSpecificCard, playCard}: Props) {
    const drawSpecificFunc = (cardIndex: number) => {
        drawSpecificCard(cardIndex, type === "DISCARD");
    }
    
    const mapPile = () => {
        return pile.map((card, ind) => {
            if((type === "DISCARD" && card.id === "A17")
            || (type === "PURE" && card.id === "A16")) return;
            return (
                <MiniCard
                    key={`card_pile__${card.id}_${ind}`}
                    isSideWays={false}
                    cardState={{state: card, index: ind}}
                    drawSpecificCard={drawSpecificFunc}
                    playCard={playCard}
                />
            )
        });
    }
    
    return (
        <div className="popup" >
            <h2>Select One To {playCard ? "Play" : "Draw"}</h2>
            <div
                className="card_picker"
            >
                {mapPile()}
            </div>
        </div>
    )
}