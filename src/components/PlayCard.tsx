import CardSchema from "../schemas/cardSchema"
import Card from "./Card"

type Props = {
    cardState: CardSchema
}

export default function PlayCard({cardState}: Props) {
    return (
        <div className="popup" >
            <Card 
                cardState={cardState}
                position={"SELECT"}
            />
            <button className="menu_link">
                Play Card
            </button>
        </div>
    )
}