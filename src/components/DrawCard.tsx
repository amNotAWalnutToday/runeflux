import Deck from "./Deck";

type Props = {
    drawCards: () => void;
}

export default function DrawCard({drawCards}: Props) {
    return (
        <div className="popup" >
            <Deck

            />
            <button 
                className="menu_link"
                onClick={drawCards}
            >
                Draw Cards
            </button>
        </div>
    )
}
