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

type TurnSchema = {
    player: string,
    drawn: number,
    played: number,
}

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
        const turn = {
            player: false,
            drawn: 0,
            played: 0
        }
        return Object.assign({}, game, {rules: startRuleData, turn});
    }

    const connectGame = async (
        gameId: string,
        db: Database,
        setTable: React.Dispatch<React.SetStateAction<GameSchema>>,
        uid: string,
        setLocalPlayer: React.Dispatch<React.SetStateAction<PlayerSchema>>,
    ) => {
        const gameRef = ref(db, `/games/${gameId}/game`);
        await onValue(gameRef, async (snapshot) => {
            const data = await snapshot.val();

            updateTable(
                data.deck, data.goal,
                data.rules,
                data.players,
                data.turn,
                data.round,
                setTable
            );
            setLocalPlayer((prev) => {
                return { ...prev, ...getPlayer(data.players, uid).state }
            });
        });
    }

    const updateTable = (
        deckData: { pure: CardSchema[], discard: CardSchema[] },
        goalData: CardSchema[],
        ruleData: RuleSchema,
        playerData: PlayerSchema[],
        turnData: {
            player: string | boolean,
            drawn: number,
            played: number,
        },
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
            rules: ruleData,
            players: playerData,
            round: roundData,
            turn: turnData
        }

        setTable((prev) => {
            return { ...prev, ...updatedTable }
        });
    }

    const upload = (
        type: string,
        db: Database,
        payload: {
            gameState?: GameSchema,
            deckState?: CardSchema[],
            turnState?: TurnSchema,
            playersState?: PlayerSchema[],
            roundState?: number,
            playerId?: string,
        },
        gameId: string
    ) => {
        const { 
            gameState, deckState, turnState, 
            playersState, playerId, roundState 
        } = payload;

        switch(type) {
            case "DECK_PURE":
                return uploadDeck(db, deckState ?? [], gameId);
            case "DECK_DISCARD":
                return uploadDeck(db, deckState ?? [], gameId, true);
            case "TURN":
                return uploadTurn(db, turnState ?? {} as TurnSchema, gameId);
            case "PLAYER": 
                return uploadPlayer(db, playersState ?? [], playerId ?? '', gameId); 
            case "ROUND":
                return uploadRound(db, roundState ?? 0, gameId);
            default:
                return uploadTable(db, gameState ?? {} as GameSchema, gameId);
        }
    }

    const uploadTable = async (db: Database, gameState: GameSchema, gameId: string) => {         
        const uploadGameState = convertGameToRoomGame(gameState);
        const gameRef = ref(db, `/games/${gameId}/game`);
        await set(gameRef, uploadGameState);
    }

    const uploadDeck = async (db: Database, deck: CardSchema[], gameId: string, isDiscard = false) => {
        const location = isDiscard ? 'discard' : 'pure';
        const deckRef = ref(db, `/games/${gameId}/game/deck/${location}`);
        await set(deckRef, deck.length ? deck : false);
    }

    const uploadTurn = async (db: Database, turn: TurnSchema, gameId: string) => {
        const turnRef = ref(db, `/games/${gameId}/game/turn`);
        await set(turnRef, turn);
    }

    const uploadPlayer = async (db: Database, players: PlayerSchema[], playerId: string, gameId) => {
        const { state, index } = getPlayer(players, playerId);
        if(!Array.isArray(state.hand) || !state.hand.length) state.hand = false;
        const playerRef = ref(db, `/games/${gameId}/game/players/${index}`);
        console.log(state);
        await set(playerRef, state);
    }

    const uploadRound = async (db: Database, round: number, gameId: string) => {
        try {
            const roundRef = ref(db, `/games/${gameId}/game/round`);
            await set(roundRef, round);
        } catch(e) {
            return console.error(e);
        }
    }

    const getPlayer = (players: PlayerSchema[], uid: string) => {
        for(let i = 0; i < players.length; i++) {
            if(uid === players[i].user.uid) return {state: players[i], index: i};
        }
        return {state: players[0], index: 0};
    }

    const chooseWhoGoesFirst = (players: PlayerSchema[]) => {
        const ran = Math.floor(Math.random() * players.length);
        return players[ran].user.uid;
    }

    const drawPhase = (
        gameState: GameSchema,
        gameSetter: React.Dispatch<React.SetStateAction<GameSchema>>, 
        player_uid: string,
        playerSetter: React.Dispatch<React.SetStateAction<PlayerSchema>>, 
        db: Database,
        gameId: string,
    ) => {
        if(gameState.round === 0) {
            // drawCards(gameState, gameSetter, player_uid, playerSetter, db, gameId, 3);
            return 3;
        } else {
            // drawCards(gameState, gameSetter, player_uid, playerSetter, db, gameId, gameState.rules.drawAmount);
            return gameState.rules.drawAmount;
        }
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
        return newDeck;
    }

    const removeCardFromDeck = (deck: CardSchema[]) => {
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
        amount = 1,
    ) => {
        const player = getPlayer(gameState.players, player_uid);
        let newDeck: CardSchema[] = [];
        for(let i = 0; i < amount; i++) {
            const { topCard, updatedDeck } = removeCardFromDeck(gameState.deck.pure);
            if(!topCard) return;
            player?.state.hand.push(topCard);
            newDeck = updatedDeck 
        }
        const updatedPlayers = [...gameState.players];
        updatedPlayers[player.index] = player.state; 
        gameSetter((prev) => {
            const updatedGame = {
                ...prev,
                deck: {
                    pure: newDeck,
                    discard: prev.deck.discard
                },
                players: updatedPlayers
            }
            uploadTable(db, updatedGame, gameId);
            return updatedGame;
        });
    }

    const endTurn = (
        db: Database, 
        players: PlayerSchema[], 
        turn, 
        turnDispatch, 
        gameId: string
    ) => {
        const currentPlayer = getPlayer(players, turn.player);
        const nextPlayer = currentPlayer.index < players.length - 1
            ? currentPlayer.index + 1
            : 0
        // const thisTurn = {
        //     ...turn,
        //     player: players[nextPlayer].user.uid
        // }
        console.log(players[nextPlayer].user.uid)
        turnDispatch({
            type: 0, 
            payload: {
                player: players[nextPlayer].user.uid,
                upload: {
                    db,
                    gameId
                }
            }
        });
        return !nextPlayer ? true : false; 
    }
    
    return {
        loadGame,
        connectGame,
        upload,
        uploadTable,
        getPlayer,
        chooseWhoGoesFirst,
        drawPhase,
        drawCards,
        shuffleDeck,
        endTurn,
    }
})();
