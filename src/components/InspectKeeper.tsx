import CardSchema from "../schemas/cardSchema";
import Card from "./Card";

type Props = {
    cardState: { state: CardSchema, index: number },
}

export default function InspectKeeper({cardState}: Props) {
    return ( 
        <div className="popup" >
            <Card 
                cardState={cardState}
                position={"SELECT"}
            />
            <div className="play_btn_group__card">
                <button
                    className="play_btn__card"
                >
                    Use Effect
                </button>
                <button className="discard_btn__card" >
                    Discard Card
                </button>
            </div>
        </div>
    )
}