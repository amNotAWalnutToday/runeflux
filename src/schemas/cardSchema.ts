interface CardSchema {
    id: string,
    type: 'KEEPER' | 'GOAL' | 'CREEPER' | 'RULE' | 'ACTION' | 'COUNTER' | string,
    subtype: 'LIVING' | 'WEAPON' | 'RUNE' | 'LOCATION' | 'BASIC' | string,
    name: string,
    effects: string[],
    text: string,
    attachment?: CardSchema | null,
    cooldown?: boolean,
    targets?: { id: string, index: number, playerIndex: number }[] | null,
}

export default CardSchema;
