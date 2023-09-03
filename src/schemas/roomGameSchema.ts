import CardSchema from "./cardSchema"
import RuleSchema from "./ruleSchema"
import UserSchema from "./userSchema"

interface roomGameSchema {
    deck: {
        pure: CardSchema[] | boolean,
        discard: CardSchema[] | boolean
    },
    goal: CardSchema[] | boolean,
    players: { 
        user: UserSchema, 
        keepers: CardSchema[] | boolean,
        hand: CardSchema[] | boolean,
    }[],
    rules: RuleSchema,
    round: number,
}

export default roomGameSchema;
