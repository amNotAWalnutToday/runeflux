import CardSchema from "./cardSchema";

type TurnSchema = {
    player: string | boolean,
    drawn: number,
    played: number,
    temporary: {
        hand: CardSchema[],
        play: number,
    },
    duel: {
        cooldown: boolean,
        card: { state: CardSchema, index: number, playerIndex: number } | null,
        player1: {
            id: string,
            num: number,
        },
        player2: {
            id: string,
            num: number,
        }
    }
}

export default TurnSchema;
