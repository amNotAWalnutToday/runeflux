import { ref, set, Database, onValue } from 'firebase/database';
import CardSchema from '../schemas/cardSchema';
import PlayerSchema from '../schemas/playerSchema';
import startDeckData from '../data/start_deck.json';
import startRuleData from '../data/start_rules.json';
import GameSchema from '../schemas/gameSchema';
import UserSchema from '../schemas/userSchema';
import RuleSchema from '../schemas/ruleSchema';
import roomFunctions from './roomFunctions';

const { convertGameToRoomGame } = roomFunctions;

export default (() => {
    const loadGame = (
        user: UserSchema | undefined, 
    ) => {
        const game = {
            deck: {
                pure: [] as CardSchema[],
                discard: [] as CardSchema[],
            },
            players: [{user: user ?? { username: 'hal', uid: '000001', isReady: true }, hand: [], keepers: []}] as PlayerSchema[],
            goal: [] as CardSchema[],
            round: 0,
        }
        for(const card of startDeckData.startDeck) {
            game.deck.pure.push(card);
        }
        return Object.assign({}, game, {rules: startRuleData});
    }

    const connectGame = async (
        gameId: string,
        db: Database,
        setTable: React.Dispatch<React.SetStateAction<GameSchema>>,
    ) => {
        const gameRef = ref(db, `/games/${gameId}/game`);
        onValue(gameRef, async (snapshot) => {
            const data = await snapshot.val();

            updateTable(
                data.deck, data.goal,
                data.rules,
                data.players,
                data.round,
                setTable
            );
        });
    }

    const updateTable = (
        deckData: { pure: CardSchema[], discard: CardSchema[] },
        goalData: CardSchema[],
        ruleData: RuleSchema,
        playerData: PlayerSchema[],
        roundData: number,
        setTable: React.Dispatch<React.SetStateAction<GameSchema>>
    ) => {
        if(!deckData.discard) deckData.discard = [];
        if(!goalData) goalData = [];
        for(const player of playerData) {
            if(!player.hand) player.hand = [];
            if(!player.keepers) player.keepers = [];
        }

        const updatedTable = {
            deck: deckData,
            goal: goalData,
            rule: ruleData,
            players: playerData,
            round: roundData
        }

        setTable((prev) => {
            return { ...prev, ...updatedTable }
        });
    }

    const uploadTable = (db: Database, gameState: GameSchema, gameId: string) => {         
        const uploadGameState = convertGameToRoomGame(gameState);
        const gameRef = ref(db, `/games/${gameId}/game`);
        set(gameRef, uploadGameState);
    }

    const getPlayer = (players: PlayerSchema[], uid: string) => {
        for(let i = 0; i < players.length; i++) {
            if(uid === players[i].user.uid) return {state: players[i], index: i};
        }
        return {state: players[0], index: 0};
    }

    const shuffleDeck = (deck: CardSchema[]) => {
        const newDeck = [];
        const oldDeck = [...deck];
        const maxDeckLength = deck.length;
        for(let deckLength = maxDeckLength; deckLength > 0; deckLength--) {
            const ran = Math.floor(Math.random() * deckLength);
            newDeck.push(oldDeck[ran]);
            oldDeck.splice(ran, 1);
        }
        console.log(newDeck);
        return newDeck;
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
        db: Database,
        gameId: string,
    ) => {
        const { topCard, updatedDeck } = removeCardFromDeck(gameState.deck.pure);
        if(!topCard) return;
        const player = getPlayer(gameState.players, player_uid);
        player?.state.hand.push(topCard);
        const updatedPlayers = [...gameState.players];
        updatedPlayers[player.index] = player.state; 
        gameSetter((prev) => {
            const updatedGame = {
                ...prev,
                deck: {
                    pure: updatedDeck,
                    discard: prev.deck.discard
                },
                players: updatedPlayers
            }
            uploadTable(db, updatedGame, gameId);
            return updatedGame;
        });
        playerSetter((prev) => {
            return { ...prev, ...player.state };
        });
    }
    
    return {
        loadGame,
        connectGame,
        uploadTable,
        getPlayer,
        drawCards,
        shuffleDeck
    }
})();
