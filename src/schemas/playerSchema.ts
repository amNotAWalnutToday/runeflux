import CardSchema from "./cardSchema";
import UserSchema from "./userSchema";

interface PlayerSchema {
    user: UserSchema,
    hand: CardSchema[]
    keepers: CardSchema[],
    isReady: boolean,
}

export default PlayerSchema;
