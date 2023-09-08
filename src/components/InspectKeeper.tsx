import CardSchema from "../schemas/cardSchema";
import Card from "./Card";

type Props = {
    cardState: { state: CardSchema, index: number },
    discardKeeper: (cardIndex: number, addToDiscard?: boolean) => void,
}

export default function InspectKeeper({cardState, discardKeeper}: Props) {
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
                <button 
                    className="discard_btn__card" 
                    onClick={() => {
                        discardKeeper(cardState.index)
                    }}
                >
                    Discard Card
                </button>
            </div>
        </div>
    )
}