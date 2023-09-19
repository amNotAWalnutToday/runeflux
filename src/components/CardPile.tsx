import CardSchema from "../schemas/cardSchema"
import MiniCard from "./MiniCard";

type Props = {
    type: string,
    pile: CardSchema[],
    drawSpecificCard: (cardIndex: number, fromDiscard?: boolean, playerId?: string) => void,
}

export default function CardPile({type, pile, drawSpecificCard}: Props) {
    const drawSpecificFunc = (cardIndex: number) => {
        if(type === "DISCARD" && !cardIndex) return;
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
                />
            )
        });
    }
    
    return (
        <div className="popup" >
            <h2>Select One To Draw</h2>
            <div
                className="card_picker"
            >
                {mapPile()}
            </div>
        </div>
    )
}