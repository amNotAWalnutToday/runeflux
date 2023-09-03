import { useState } from "react";
import Card from "./Card"
import CardSchema from "../schemas/cardSchema";

type Props = {
    selectCard: (card: CardSchema | null) => void,
}

export default function HandOfCards({selectCard}: Props) {
    const [tempDeck, setTempDeck] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const mapHand = () => {
        return tempDeck.map((card: CardSchema | number, index: number) => {
            return (
                <Card 
                    key={`hand_card_${index}`} 
                    position={"HAND"} 
                    numberInLine={index + 1} 
                    selectCard={selectCard}
                />
            )
        })
    }

    return (
        <div className="hand_container">
            { mapHand() }
        </div>
    )
}