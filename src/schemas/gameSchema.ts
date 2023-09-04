import RuleSchema from "./ruleSchema";
import CardSchema from "./cardSchema";
import PlayerSchema from "./playerSchema";

interface GameSchema {
    deck: {
        pure: CardSchema[],
        discard: CardSchema[],
    },
    goal: CardSchema[],
    rules: RuleSchema,
    players: PlayerSchema[],
    turn: {
        player: string | boolean,
        drawn: number,
        played: number,
    },
    round: number,
}

export default GameSchema;
