interface CardSchema {
    type: 'KEEPER' | 'GOAL' | 'CREEPER' | 'RULE' | 'ACTION' | 'COUNTER',
    subtype: 'LIVING' | 'WEAPON' | 'RUNE' | 'LOCATION' | 'BASIC' | '',
    name: string,
    text: {
        flavour: string,
        specialEffect: string,
    }
}

export default CardSchema;
