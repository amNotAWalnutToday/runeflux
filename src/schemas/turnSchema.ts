type TurnSchema = {
    player: string | boolean,
    drawn: number,
    played: number,
    temporary: {
        hand: [],
        play: number,
    } 
}

export default TurnSchema;
