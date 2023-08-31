import CardSchema from "./cardSchema";

interface PlayerSchema {
    user: /*UserSchema*/null,
    hand: CardSchema[]
    keepers: CardSchema[],
}

export default PlayerSchema;
