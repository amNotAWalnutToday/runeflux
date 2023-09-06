import GameSchema from "../schemas/gameSchema";

type Props = {
    table: GameSchema,
    endTurn: () => void,
}

export default function EndTurn({table, endTurn}: Props) {
    return (
        <>
            <button
                className="endturn_btn"
                onClick={endTurn}
                disabled={
                    table.turn.drawn < table.rules.drawAmount
                    || table.turn.played < table.rules.playAmount
                }
            >
                End Turn
            </button>  
        </>
    )
}
