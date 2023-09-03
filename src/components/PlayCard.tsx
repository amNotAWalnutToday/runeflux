import Card from "./Card"

export default function PlayCard() {
    return (
        <div className="popup" >
            <Card position={"HAND"} />
            <button className="menu_link">
                Play Card
            </button>
        </div>
    )
}