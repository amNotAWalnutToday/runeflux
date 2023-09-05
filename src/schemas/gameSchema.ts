import RuleSchema from "./ruleSchema";
import CardSchema from "./cardSchema";
import PlayerSchema from "./playerSchema";
import DeckSchema from "./deckSchema";

interface GameSchema {
    deck: DeckSchema,
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
