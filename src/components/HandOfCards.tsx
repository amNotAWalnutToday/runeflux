import { useState } from "react";
import Card from "./Card"
import CardSchema from "../schemas/cardSchema";

type Props = {
    hand: CardSchema[],
    selectCard: (card: CardSchema | null) => void,
}

export default function HandOfCards({hand, selectCard}: Props) {
    const mapHand = () => {
        return hand.map((card: CardSchema | number, index: number) => {
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