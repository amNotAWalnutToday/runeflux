import RuleSchema from "./ruleSchema";
import CardSchema from "./cardSchema";
import PlayerSchema from "./playerSchema";
import DeckSchema from "./deckSchema";
import TurnSchema from "./turnSchema";

interface GameSchema {
    deck: DeckSchema,
    goal: CardSchema[],
    rules: RuleSchema,
    players: PlayerSchema[],
    turn: TurnSchema,
    pending: CardSchema | boolean,
    counter: CardSchema | boolean,
    history: {
        played: {id: string, target: string, player: string}[],
        discarded: string[],
    },
    phases: {
        morytania: number,
        abyss: number,
        wilderness: number,
    },
    round: number,
    isWon: boolean,
}

export default GameSchema;
