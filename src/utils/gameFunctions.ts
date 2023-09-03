import CardSchema from '../schemas/cardSchema';
import PlayerSchema from '../schemas/playerSchema';
import startDeckData from '../data/start_deck.json';
import startRuleData from '../data/start_rules.json';
import GameSchema from '../schemas/gameSchema';
import UserSchema from '../schemas/userSchema';

export default (() => {
    const loadGame = (user: UserSchema | undefined) => {
        const game = {
            deck: {
                pure: [] as CardSchema[],
                discard: [] as CardSchema[],
            },
            players: [{user: user ?? { username: 'hal', uid: '000001' }, hand: [], keepers: []}] as PlayerSchema[],
            goal: [] as CardSchema[],
            round: 0,
        }
        for(const card of startDeckData.startDeck) {
            game.deck.pure.push(card);
        }
        return Object.assign({}, game, {rules: startRuleData});
    }

    const getPlayer = (players: PlayerSchema[], uid: string) => {
        for(let i = 0; i < players.length - 1; i++) {
            if(uid === players[i].user.uid) return {state: players[i], index: i};
        }
        return {state: players[0], index: 0};
    }

    const removeCardFromDeck = (deck: CardSchema[]) => {
        console.log(deck);
        const topCard = deck.pop();
        return { topCard, updatedDeck: deck };
    }

    const drawCards = (
        gameState: GameSchema,
        gameSetter: React.Dispatch<React.SetStateAction<GameSchema>>, 
        player_uid: string,
        playerSetter: React.Dispatch<React.SetStateAction<PlayerSchema>>, 
        amount: number
    ) => {
        const { topCard, updatedDeck } = removeCardFromDeck(gameState.deck.pure);
        if(!topCard) return;
        const player = getPlayer(gameState.players, player_uid);
        player?.state.hand.push(topCard);
        const updatedPlayers = [...gameState.players];
        updatedPlayers[player.index] = player.state; 
        gameSetter((prev) => {
            return {...prev, deck: {
                pure: updatedDeck,
                discard: prev.deck.discard
            }, players: updatedPlayers}
        });
        playerSetter((prev) => {
            return { ...prev, ...player.state };
        });
    }
    
    return {
        loadGame,
        getPlayer,
        drawCards
    }
})();
