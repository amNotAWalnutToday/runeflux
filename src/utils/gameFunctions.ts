import { ref, get, child, set, Database, onValue } from 'firebase/database';
import CardSchema from '../schemas/cardSchema';
import PlayerSchema from '../schemas/playerSchema';
import TurnSchema from '../schemas/turnSchema';
import startDeckData from '../data/start_deck.json';
import startRuleData from '../data/start_rules.json';
import GameSchema from '../schemas/gameSchema';
import UserSchema from '../schemas/userSchema';
import RuleSchema from '../schemas/ruleSchema';
import DeckSchema from '../schemas/deckSchema';
import roomFunctions from './roomFunctions';

const { convertGameToRoomGame, convertToRoomPlayer } = roomFunctions;

export default (() => {
    const loadGame = (
        user: UserSchema | undefined, 
    ) => {
        const game = {
            deck: {
                pure: [] as CardSchema[],
                discard: [] as CardSchema[],
            },
            players: [{user: user ?? { username: 'hal', uid: '000001', isReady: true }, hand: [], keepers: [], isReady: false}] as PlayerSchema[],
            goal: [] as CardSchema[],
            round: 0,
            pending: false,
            counter: false,
        }
        for(const card of startDeckData.startDeck) {
            game.deck.pure.push(card);
        }
        const turn: TurnSchema = {
            player: false,
            drawn: 0,
            played: 0,
            temporary: {
                hand: [],
                play: 0,
            },
            duel: {
                cooldown: false,
                card: null,
                player1: {
                    id: '',
                    num: 0
                },
                player2: {
                    id: '',
                    num: 0,
                }
            }
        }
        return Object.assign({}, game, {rules: startRuleData, turn});
    }

    const connectGame = async (
        gameId: string,
        db: Database,
        init: (
            deckData: DeckSchema,
            goalData: CardSchema[],
            ruleData: RuleSchema,
            playerData: PlayerSchema[],
            turnData: TurnSchema,
            roundData: number,
            pendingData: CardSchema | false,
            counterData: CardSchema | false,
        ) => void,
    ) => {
        try {
            const gameRef = ref(db, `/games/${gameId}/game`);
            await get(child(gameRef, '/')).then( async (snapshot) => {
                const data = await snapshot.val();
                init(
                    data.deck, data.goal,
                    data.rules,
                    data.players,
                    data.turn,
                    data.round,
                    data.pending,
                    data.counter,
                );
            });
            await onValue(gameRef, async (snapshot) => {
                const data = await snapshot.val();
                init(
                    data.deck, data.goal,
                    data.rules,
                    data.players,
                    data.turn,
                    data.round,
                    data.pending,
                    data.counter,
                );
            });
        } catch(e) {
            console.error(e);
        }
    }

    const upload = (
        type: string,
        db: Database,
        payload: {
            gameState?: GameSchema,
            deckState?: CardSchema[],
            turnState?: TurnSchema,
            playersState?: PlayerSchema[],
            ruleState?: RuleSchema,
            roundState?: number,
            cardState?: CardSchema | false,
            goalState?: CardSchema[],
            playerId?: string,
        },
        gameId: string
    ) => {
        const { 
            gameState, deckState, turnState, 
            playersState, playerId, roundState,
            ruleState, cardState, goalState
        } = payload;

        switch(type) {
            case "DECK_PURE":
                return uploadDeck(db, deckState ?? [], gameId);
            case "DECK_DISCARD":
                return uploadDeck(db, deckState ?? [], gameId, true);
            case "RULES":
                return uploadRules(db, ruleState ?? {} as RuleSchema, gameId);
            case "TURN":
                return uploadTurn(db, turnState ?? {} as TurnSchema, gameId);
            case "PLAYER": 
                return uploadPlayer(db, playersState ?? [], playerId ?? '', gameId); 
            case "ROUND":
                return uploadRound(db, roundState ?? 0, gameId);
            case "PENDING":
                return uploadPending(db, cardState ?? false, gameId);
            case "COUNTER":
                return uploadCounter(db, cardState ?? false, gameId)
            case "GOAL":
                return uploadGoal(db, goalState ?? [], gameId);
            default:
                return uploadTable(db, gameState ?? {} as GameSchema, gameId);
        }
    }

    const uploadTable = async (db: Database, gameState: GameSchema, gameId: string) => {         
        try {
            const uploadGameState = convertGameToRoomGame(gameState);
            const gameRef = ref(db, `/games/${gameId}/game`);
            await set(gameRef, uploadGameState);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadDeck = async (db: Database, deck: CardSchema[], gameId: string, isDiscard = false) => {
        try {
            const location = isDiscard ? 'discard' : 'pure';
            const deckRef = ref(db, `/games/${gameId}/game/deck/${location}`);
            await set(deckRef, deck.length ? deck : false);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadTurn = async (db: Database, turn: TurnSchema, gameId: string) => {
        try {     
            const turnRef = ref(db, `/games/${gameId}/game/turn`);
            await set(turnRef, Object.assign({}, turn, {temporary: { ...turn.temporary, hand: turn.temporary.hand.length ? turn.temporary.hand : false }}));
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadRules = async (db: Database, rules: RuleSchema, gameId: string) => {
        try {
            const ruleRef = ref(db, `/games/${gameId}/game/rules`);
            await set(ruleRef, rules);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadPlayer = async (db: Database, players: PlayerSchema[], playerId: string, gameId: string) => {
        try {
            const { state, index } = getPlayer(players, playerId);
            const roomPlayer = convertToRoomPlayer(state);
            const playerRef = ref(db, `/games/${gameId}/game/players/${index}`);
            await set(playerRef, roomPlayer);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadRound = async (db: Database, round: number, gameId: string) => {
        try {
            const roundRef = ref(db, `/games/${gameId}/game/round`);
            await set(roundRef, round);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadPending = async (db: Database, card: CardSchema | false, gameId: string) => {
        try {
            const pendingRef = ref(db, `/games/${gameId}/game/pending`);
            await set(pendingRef, card);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadCounter = async (db: Database, card: CardSchema | false, gameId: string) => {
        try {
            const counterRef = ref(db, `/games/${gameId}/game/counter`);
            await set(counterRef, card);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadGoal = async (db: Database, cards: CardSchema[], gameId: string) => {
        try {
            const goalRef = ref(db, `/games/${gameId}/game/goal`);
            await set(goalRef, cards?.length ? cards : false);
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

    const getCardById = (cardId: string) => {
        for(const card of startDeckData.startDeck) {
            if(cardId === card.id) {
                return card;
            }
        }
        return startDeckData.startDeck[0];
    }

    const getInitRule = (key: string): number | string | boolean => {
        const startingRules: {[key: string]: number | string | boolean} = startRuleData
        for(const rule in startingRules) {
            if(key === rule) return (startingRules[rule]);
        }
        return 0;
    }

    const chooseWhoGoesFirst = (players: PlayerSchema[]) => {
        const ran = Math.floor(Math.random() * players.length);
        return players[ran].user.uid;
    }

    const checkShouldDiscard = (cardType: string) => {
        switch(cardType) {
            case "GOAL":
            case "KEEPER":
            case "CREEPER":
                return false;
            case "ACTION":
            case "COUNTER":
            case "RULE":
                return true;
            default:
                return true;
        }
    }

    const checkForCreepers = (cards: CardSchema[]) => {
        const creepers: CardSchema[] = [];
        for(const card of cards) {
            if(card.type === "CREEPER") creepers.push(card);
        }
        return creepers;
    }

    const checkPlayersForKeeper = (players: PlayerSchema[], keeperId: string) => {
        const match = { keeper: <CardSchema | null> null, index: 0, playerIndex: 0 }; 
        players.forEach((player, playerIndex) => {
            player.keepers.forEach((keeper, cardIndex) => {
                if(keeper.id === keeperId) {
                    match.keeper = keeper;
                    match.index = cardIndex;
                    match.playerIndex = playerIndex;
                }
            });
        });
        return match;
    }

    const drawPhase = (
        gameState: GameSchema,
    ) => {
        if(gameState.round === 0) {
            return 3;
        } else {
            return gameState.rules.drawAmount - gameState.turn.drawn;
        }
    }

    const removeCard = (cards: CardSchema[], cardIndex: number) => {
        const firstHalf = cards.slice(0, cardIndex);
        const lastHalf = cards.slice(cardIndex + 1);
        console.log(firstHalf, lastHalf);
        return firstHalf.concat(lastHalf);
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

    const endTurn = (
        db: Database, 
        players: PlayerSchema[], 
        turn: TurnSchema, 
        turnDispatch, 
        gameId: string
    ) => {
        const currentPlayer = getPlayer(players, turn.player.toString());
        const nextPlayer = currentPlayer.index < players.length - 1
            ? currentPlayer.index + 1
            : 0

        turnDispatch({
            type: 1, 
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
        getCardById,
        getInitRule,
        chooseWhoGoesFirst,
        checkShouldDiscard,
        checkForCreepers,
        checkPlayersForKeeper,
        drawPhase,
        removeCard,
        shuffleDeck,
        endTurn,
    }
})();
