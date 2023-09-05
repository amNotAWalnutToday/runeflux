import CardSchema from "./cardSchema";

interface DeckSchema {
    pure: CardSchema[],
    discard: CardSchema[],
}

export default DeckSchema;
