interface CardSchema {
    type: 'KEEPER' | 'GOAL' | 'CREEPER' | 'RULE' | 'ACTION' | 'COUNTER' | string,
    subtype: 'LIVING' | 'WEAPON' | 'RUNE' | 'LOCATION' | 'BASIC' | string,
    name: string,
    effects: string[],
    text: {
        flavour: string,
        specialEffect: string,
    }
}

export default CardSchema;
