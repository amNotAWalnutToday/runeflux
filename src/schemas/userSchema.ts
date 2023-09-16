interface UserSchema {
    username: string,
    uid: string,
    icon: string,
    isReady: boolean
    stats: {
        wins: number,
        played: number,
        totalRounds: number,
    },
    cardCatalog: {[key: string]: number},
    goalWins: {[key: string]: number}
}

export default UserSchema;
