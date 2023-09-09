import Card from "./Card"
import CardSchema from "../schemas/cardSchema";

type Props = {
    hand: CardSchema[],
    selectCard: (card: { state: CardSchema, index: number } | null) => void,
}

export default function HandOfCards({hand, selectCard}: Props) {    
    const mapHand = () => {
        return hand.map((card: CardSchema, index: number) => {
            return (
                <Card 
                    key={`hand_card_${index}`} 
                    cardState={{ state: card, index}}
                    position={"HAND"} 
                    numberInLine={index + 1} 
                    selectCard={selectCard}
                />
            )
        })
    }

    return (
        <div 
            className="hand_container"
        >
            { mapHand() }
        </div>
    )
}