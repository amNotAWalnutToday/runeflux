import CardSchema from "./cardSchema";

type TurnSchema = {
    player: string | boolean,
    drawn: number,
    played: number,
    temporary: {
        hand: CardSchema[],
        play: number,
    } 
}

export default TurnSchema;
