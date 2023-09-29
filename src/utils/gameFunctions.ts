import { ref, get, child, set, Database, onValue } from 'firebase/database';
import CardSchema from '../schemas/cardSchema';
import PlayerSchema from '../schemas/playerSchema';
import TurnSchema from '../schemas/turnSchema';
import startDeckData from '../data/start_deck.json';
import allDeckData from '../data/all_cards.json';
import fakeCards from '../data/fake_cards.json';
import start_rules from '../data/start_rules.json';
import GameSchema from '../schemas/gameSchema';
import UserSchema from '../schemas/userSchema';
import RuleSchema from '../schemas/ruleSchema';
import DeckSchema from '../schemas/deckSchema';
import roomFunctions from './roomFunctions';
import goalFunctions from './goalFunctions';
import TURN_REDUCER_ACTION from '../schemas/reducers/TURN_REDUCER_ACTIONS';
import DECK_REDUCER_ACTIONS from '../schemas/reducers/DECK_REDUCER_ACTIONS';
import RULE_REDUCER_ACTIONS from '../schemas/reducers/RULE_REDUCER_ACTIONS';
import PLAYER_REDUCER_ACTIONS from '../schemas/reducers/PLAYER_REDUCER_ACTIONS';
import GOAL_REDUCER_ACTIONS from '../schemas/reducers/GOAL_REDUCER_ACTIONS';

const { compareKeepersToGoal } = goalFunctions;
const { convertGameToRoomGame, convertToRoomPlayer } = roomFunctions;

export default (() => {
    type TURN_ACTIONS = {
        type: TURN_REDUCER_ACTION,
        payload: {
            init?: TurnSchema,
            player?: string,
            victim?: string,
            amount?: number,
            duelCard?: { state: CardSchema, index: number, playerIndex: number },
            cards?: CardSchema[],
            upload: {
                db: Database,
                gameId: string,
            }
        }
    }
    
    const turnReducer = (state: TurnSchema, action: TURN_ACTIONS) => {
        const { player, victim, amount, duelCard, cards, init } = action.payload;
        const { db, gameId } = action.payload.upload; 
        const { temporary } = state;
        const rollNum = Math.ceil(Math.random() * 100);
    
        switch(action.type) {
            case TURN_REDUCER_ACTION.INIT:
                return Object.assign({}, state, {...init});
            case TURN_REDUCER_ACTION.CHANGE_TURN:
                upload("TURN", db, {turnState: Object.assign({}, state, {player, drawn: 0, played: 0})}, gameId);
                return Object.assign({}, state, {player, drawn: 0, played: 0});
            case TURN_REDUCER_ACTION.DRAWN_ADD:
                upload("TURN", db, {turnState: Object.assign({}, state, {player, drawn: amount})}, gameId);
                return Object.assign({}, state, {player, drawn: amount});
            case TURN_REDUCER_ACTION.PLAYED_ADD:
                upload("TURN", db, {turnState: Object.assign({}, state, {played: amount})}, gameId);
                return Object.assign({}, state, {played: amount});
            case TURN_REDUCER_ACTION.TEMPORARY_HAND__BEGIN:
                upload("TURN", db, {turnState: Object.assign({}, state, {temporary: { ...temporary, hand: cards ? [...cards] : [], play: amount ?? 0 }})}, gameId);
                return Object.assign({}, state, {temporary: { ...temporary, hand: cards ? [...cards] : [] }, play: amount ?? 0});
            case TURN_REDUCER_ACTION.TEMPORARY_HAND_CARD__REMOVE:
                upload("TURN", db, {turnState: Object.assign({}, state, {temporary: { ...temporary, hand: cards ? [...cards] : [] }})}, gameId);
                return Object.assign({}, state, {temporary: { ...temporary, hand: cards ? [...cards] : [] }});
            case TURN_REDUCER_ACTION.TEMPORARY_HAND_CARD__ADD:
                upload("TURN", db, {turnState: Object.assign({}, state, {temporary: {...temporary, hand: temporary && cards ? [...temporary.hand, ...cards] : []}})}, gameId);
                return Object.assign({}, state, {temporary: { ...temporary, hand: temporary && cards ? [...temporary.hand, ...cards] : [] }});
            case TURN_REDUCER_ACTION.TEMPORARY_PLAY_CHANGE:
                upload("TURN", db, {turnState: Object.assign({}, state, {temporary: {...temporary, play: amount}})}, gameId);
                return Object.assign({}, state, {temporary: { ...temporary, play: amount }});
            case TURN_REDUCER_ACTION.DUEL_BEGIN: 
                upload("TURN", db, {turnState: Object.assign({}, state, {duel: {cooldown: true, card: duelCard, player1: {id: player, num: 0}, player2: { id: victim, num: 0 }}})}, gameId);
                return Object.assign({}, state, {duel: {cooldown: true, card: duelCard, player1: { id: player, num: 0 }, player2: { id: victim, num: 0 }}});
            case TURN_REDUCER_ACTION.DUEL_ROLL__PLAYER_1:
                upload("TURN", db, {turnState: Object.assign({}, state, {duel: {...state.duel, player1: {...state.duel.player1, num: rollNum}}})}, gameId);
                return Object.assign({}, state, {duel: {...state.duel, player1: {...state.duel.player1, num: rollNum}}});
            case TURN_REDUCER_ACTION.DUEL_ROLL__PLAYER_2:
                upload("TURN", db, {turnState: Object.assign({}, state, {duel: {...state.duel, player2: {...state.duel.player2, num: rollNum}}})}, gameId);
                return Object.assign({}, state, {duel: {...state.duel, player2: {...state.duel.player2, num: rollNum}}});
            case TURN_REDUCER_ACTION.DUEL_END:
                upload("TURN", db, {turnState: Object.assign({}, state, {duel: {...state.duel, player1: {id: '', num: 0}, player2: {id: '', num: 0}}})}, gameId);
                return Object.assign({}, state, {duel: {...state.duel, player1: {id: '', num: 0}, player2: {id: '', num: 0}}});
            case TURN_REDUCER_ACTION.DUEL_COOLDOWN:
                upload("TURN", db, {turnState: Object.assign({}, state, {duel: {...state.duel, cooldown: false}})}, gameId);
                return Object.assign({}, state, {duel: {...state.duel, cooldown: false}});
            default:
                return state;
        }
    }

    type RULE_ACTIONS = {
        type: RULE_REDUCER_ACTIONS
        payload: {
            init? : RuleSchema,
            ruleKey? : string,
            amount?: number,
            location?: string,
            teleblock?: boolean,
            upload: {
                db: Database,
                gameId: string,
            }
        },
    }
    
    const rulesReducer = (state: RuleSchema, action: RULE_ACTIONS) => {
        const { init, ruleKey, amount, location, teleblock } = action.payload;
        const { db, gameId } = action.payload.upload;
        const locations = ["MISTHALIN", "ASGARNIA", "MORYTANIA", "ABYSS", "WILDERNESS"];
        const ran = Math.floor(Math.random() * locations.length);
    
        switch(action.type) {
            case RULE_REDUCER_ACTIONS.INIT:
                return Object.assign({}, state, {...init});
            case RULE_REDUCER_ACTIONS.RULE_CHANGE__DRAW:
                upload("RULES", db, {ruleState: {...state, drawAmount: amount ?? 1}}, gameId);
                return Object.assign({}, state, {drawAmount: amount ?? 1});
            case RULE_REDUCER_ACTIONS.RULE_CHANGE__PLAY:
                upload("RULES", db, {ruleState: {...state, playAmount: amount ?? 1}}, gameId);
                return Object.assign({}, state, {playAmount: amount ?? 1});
            case RULE_REDUCER_ACTIONS.RULE_CHANGE__HAND_LIMIT:
                upload("RULES", db, {ruleState: {...state, handLimit: amount ?? 1}}, gameId);
                return Object.assign({}, state, {handLimit: amount ?? 1});
            case RULE_REDUCER_ACTIONS.RULE_CHANGE__KEEPER_LIMIT:
                upload("RULES", db, {ruleState: {...state, keeperLimit: amount ?? 1}}, gameId);
                return Object.assign({}, state, {keeperLimit: amount ?? 1});
            case RULE_REDUCER_ACTIONS.RULE_CHANGE__LOCATION:
                upload("RULES", db, {ruleState: {...state, location: location ?? "MISTHALIN"}}, gameId);
                return Object.assign({}, state, {location: location ?? "MISTHALIN"});
            case RULE_REDUCER_ACTIONS.RULE_CHANGE__LOCATION_RANDOM: 
                upload("RULES", db, {ruleState: {...state, location: locations[ran]}}, gameId);
                return Object.assign({}, state, {location: locations[ran]});
            case RULE_REDUCER_ACTIONS.RULE_CHANGE__TELEBLOCK:
                upload("RULES", db, {ruleState: {...state, teleblock: teleblock ?? false}}, gameId);
                return Object.assign({}, state, {teleblock: teleblock ?? false});
            case RULE_REDUCER_ACTIONS.RULE_RESET__CHOICE: 
                upload("RULES", db, {ruleState: {...state, [`${ruleKey}`]: getInitRule(ruleKey ?? "")}}, gameId);
                return Object.assign({}, state, {[`${ruleKey}`]: getInitRule(ruleKey ?? "")});
            case RULE_REDUCER_ACTIONS.RULE_RESET__ALL:
                upload("RULES", db, { ruleState: {...start_rules} }, gameId);
                return Object.assign({}, state, { ...start_rules });
            default: 
                return state;
        }
    }

    type DECK_ACTIONS = {
        type: DECK_REDUCER_ACTIONS,
        payload: {
            init?: DeckSchema,
            pile: CardSchema[],
            amount?: number,
            cardIndex?: number,
            upload: {
                db: Database,
                gameId: string,
            }
        }
    }
    
    const deckReducer = (state: DeckSchema, action: DECK_ACTIONS) => {
        const { amount, cardIndex, init } = action.payload;
        const { db, gameId } = action.payload.upload;
        let pile = action.payload.pile;
        if(pile.length) {
            pile = removeAttachments(pile);
            pile = resetCardCooldowns(pile);
        }

        switch(action.type) {
            case DECK_REDUCER_ACTIONS.INIT:
                return Object.assign({}, state, {...init});
            case DECK_REDUCER_ACTIONS.DECK_REPLACE__PURE:
                upload("DECK_PURE", db, {deckState: pile}, gameId);
                return Object.assign({}, state, {pure: [...pile]});
            case DECK_REDUCER_ACTIONS.DECK_REPLACE__DISCARD_TO_PURE:
                upload("DECK_PURE", db, {deckState: [...pile]}, gameId);
                upload("DECK_DISCARD", db, {deckState: []}, gameId);
                return Object.assign({}, state, {pure: [...pile], discard: []});
            case DECK_REDUCER_ACTIONS.DECK_REMOVE__PURE_TOP:
                upload("DECK_PURE", db, {deckState: [...state.pure.slice(0, state.pure.length - (amount ?? 0))]}, gameId);
                return Object.assign({}, state, {pure: [...state.pure.slice(0, state.pure.length - (amount ?? 0))]})
            case DECK_REDUCER_ACTIONS.DECK_REMOVE__PURE_SPECIFIC: 
                upload("DECK_PURE", db, {deckState: [...removeCard(state.pure, cardIndex ?? 0)]}, gameId);
                return Object.assign({}, state, {pure: [...removeCard(state.pure, cardIndex ?? 0)]});
            case DECK_REDUCER_ACTIONS.DECK_REMOVE__DISCARD_SPECIFIC:
                upload("DECK_DISCARD", db, {deckState: [...removeCard(state.discard, cardIndex ?? 0)]}, gameId);
                return Object.assign({}, state, {discard: [...removeCard(state.discard, cardIndex ?? 0)]});
            case DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT:
                upload("DECK_DISCARD", db, {deckState: pile ? [...pile].concat([...state.discard]) : []}, gameId);
                return Object.assign({}, state, {discard: pile ? [...pile].concat([...state.discard]) :[]});
            case DECK_REDUCER_ACTIONS.DECK_SHUFFLE__PURE:
                upload("DECK_PURE", db, {deckState: [...shuffleDeck(state.pure)]}, gameId);
                return Object.assign({}, state, {pure: [...shuffleDeck(state.pure)]});
            default: 
                return state;
        }
    }

    type PLAYER_ACTIONS = {
        type: PLAYER_REDUCER_ACTIONS,
        payload: {
            playerId: string,
            targetPlayerId?: string,
            init?: PlayerSchema[],
            cards?: CardSchema[],
            keepersToExchange?: {state: CardSchema, index: number, playerIndex: number}[], 
            cardIndex?: number,
            cooldown?: boolean,
            upload: {
                db: Database,
                gameId: string,
            }
        }
    }
    
    const playerReducer = (state: PlayerSchema[], action: PLAYER_ACTIONS) => {
        const { 
            playerId, init, cards, 
            targetPlayerId, keepersToExchange, cardIndex, 
            cooldown,
        } = action.payload;
        const { db, gameId } = action.payload.upload;
        const players = [...state];
        const player = getPlayer(state, playerId);
        const targetPlayer = targetPlayerId ? getPlayer(state, targetPlayerId) : { state: {} as PlayerSchema, index: 0};
        switch(action.type) {
            case PLAYER_REDUCER_ACTIONS.INIT:
                return init ? [...init] : [];
            case PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD:
                players[player.index] = Object.assign({}, player.state, {hand: [...player.state.hand, ...cards ?? []]});
                upload("PLAYER", db, {playersState: players, playerId}, gameId);
                return [...players]; 
            case PLAYER_REDUCER_ACTIONS.HAND_CARDS__REMOVE:
                players[player.index].hand = cards ? [...cards] : [];
                upload("PLAYER", db, {playersState: players, playerId}, gameId);
                return [...players];
            case PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD:
                players[player.index] = Object.assign({}, player.state, {keepers: player.state.keepers ? [...player.state.keepers, ...cards ?? []] : [...cards ?? []]});
                upload("PLAYER", db, {playersState: players, playerId}, gameId);
                return [...players];
            case PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE:
                players[player.index].keepers = cards ? [...cards] : [];
                upload("PLAYER", db, {playersState: players, playerId}, gameId);
                return [...players];
            case PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__EXCHANGE:
                if(!keepersToExchange) return [...players];
                console.log(keepersToExchange);
                players[keepersToExchange[0].playerIndex] = Object.assign({}, players[keepersToExchange[0].playerIndex], {keepers: [...removeCard([...players[keepersToExchange[0].playerIndex].keepers], keepersToExchange[0].index), cards ? cards[1] : {}]});
                players[keepersToExchange[1].playerIndex] = Object.assign({}, players[keepersToExchange[1].playerIndex], {keepers: [...removeCard([...players[keepersToExchange[1].playerIndex].keepers], keepersToExchange[1].index), cards ? cards[0] : {}]});
                upload("PLAYER", db, {playersState: players, playerId: players[keepersToExchange[0].playerIndex].user.uid}, gameId);
                upload("PLAYER", db, {playersState: players, playerId: players[keepersToExchange[1].playerIndex].user.uid}, gameId);
                return [...players];
            case PLAYER_REDUCER_ACTIONS.KEEPER_COOLDOWN__SET:
                players[player.index].keepers[cardIndex ?? 0].cooldown = cooldown;
                upload("PLAYER", db, {playersState: players, playerId}, gameId);
                return [...players];
            case PLAYER_REDUCER_ACTIONS.TRADE_HANDS:
                players[player.index]             = Object.assign({}, player.state, {hand: [...targetPlayer.state.hand]});
                players[targetPlayer?.index ?? 0] = Object.assign({}, targetPlayer?.state, {hand: [...player.state.hand]});
                upload("PLAYER", db, {playersState: players, playerId}, gameId);
                upload("PLAYER", db, {playersState: players, playerId: targetPlayerId}, gameId);
                return [...players];
            default:
                return state;
        }
    }

    type GOAL_ACTIONS = {
        type: GOAL_REDUCER_ACTIONS,
        payload: {
            goals: CardSchema[],
            replaceIndex?: number,
            upload: {
                db: Database,
                gameId: string,
            }
        }
    }

    const goalReducer = (state: CardSchema[], action: GOAL_ACTIONS) => {
        const { goals, replaceIndex } = action.payload;
        const { db, gameId } = action.payload.upload;

        switch(action.type) {
            case GOAL_REDUCER_ACTIONS.INIT:
                return goals ? [...goals] : [];
            case GOAL_REDUCER_ACTIONS.GOAL_REPLACE__SINGLE:
                upload("GOAL", db, {goalState: goals?.length ? [...goals] : []}, gameId);
                return [...goals]; 
            case GOAL_REDUCER_ACTIONS.GOAL_ADD__MULTI:
                upload("GOAL",  db, {goalState: goals?.length ? [...state, ...goals] : []}, gameId);
                return [...state, ...goals];
            case GOAL_REDUCER_ACTIONS.GOAL_REPLACE__MULTI:
                upload("GOAL", db, {goalState: replaceIndex === 0 ? [...goals, state[1]] : [state[0], ...goals]}, gameId);
                return replaceIndex === 0 ? [...goals, state[1]] : [state[0], ...goals];
            case GOAL_REDUCER_ACTIONS.GOAL_RESET:
                upload("GOAL", db, {goalState: []}, gameId);
                return [];
            default:
                return state;
        }
    }

    const loadGame = (
        user: UserSchema | undefined, 
    ) => {
        const game = {
            deck: {
                pure: [] as CardSchema[],
                discard: [] as CardSchema[],
            },
            history: {
                played: [],
                discarded: [],
            },
            players: [{user: user ?? { username: 'hal', uid: '000001', isReady: true }, hand: [], keepers: [], isReady: false}] as PlayerSchema[],
            goal: [] as CardSchema[],
            round: 0,
            pending: false,
            counter: false,
            isWon: false,
            phases: {
                morytania: 0,
                abyss: 0,
                wilderness: 0,
            }
        }
        for(const cardRef of startDeckData.startDeck) {
            for(const card of allDeckData.allCards) {
                if(cardRef === card.id) game.deck.pure.push(card);
            }
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
        return Object.assign({}, game, {rules: start_rules, turn});
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
            winData: boolean,
            phaseData: { morytania: 0, abyss: 0, wilderness: 0 }, 
            historyData: { played: {id: string, target: string[], player: string}[], discarded: string[] },
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
                    data.isWon,
                    data.phases,
                    data.history,
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
                    data.isWon,
                    data.phases,
                    data.history,
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
            phaseState?: {location: string, amount: number},
            historyState?: string[] | {id: string, target: string[], player: string}[],
            playerId?: string,
        },
        gameId: string
    ) => {
        const { 
            gameState, deckState, turnState, 
            playersState, playerId, roundState,
            ruleState, cardState, goalState,
            phaseState, historyState,
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
            case "WIN":
                return uploadWin(db, gameId);
            case "PHASE":
                return uploadPhase(db, phaseState?.location ?? '', phaseState?.amount ?? 0, gameId);
            case "HISTORY_PLAYED":
                return uploadHistory(db, "played", historyState ?? [], gameId);
            case "HISTORY_DISCARDED":
                return uploadHistory(db, "discarded", historyState ?? [], gameId);
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

    const uploadWin = async (db: Database, gameId: string) => {
        try {
            const winRef = ref(db, `/games/${gameId}/game/isWon`);
            await set(winRef, true);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadPhase = async (db: Database, location: string, amount: number, gameId: string) => {
        try {
            const phaseRef = ref(db, `/games/${gameId}/game/phases/${location}`);
            await set(phaseRef, amount ?? 0);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadHistory = async (db: Database, type: string, history: string[] | {id: string, target: string[], player: string}[], gameId: string) => {
        try {
            const historyRef = ref(db, `/games/${gameId}/game/history/${type}`);
            await set(historyRef, history.length ? history : false);
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

    const getPlayerKeeper = (player: PlayerSchema, kid: string) => {
        if(!player.keepers) return false;
        for(const keeper of player.keepers) {
            if(keeper.id === kid) return keeper;
        }
        return false;
    }

    const getFakeRuleCard = (type: string) => {
        for(const card of fakeCards.fakeCards) {
            if(type === "location" && card.id === "RLF01") return { card, error: false };
            if(type === "drawAmount" && card.id === "RBF02") return { card, error: false };
            if(type === "playAmount" && card.id === "RBF03") return { card, error: false };
            if(type === "handLimit" && card.id === "RBF04") return { card, error: false };
            if(type === "keeperLimit" && card.id === "RBF05") return { card, error: false};
            if(type === "teleblock" && card.id === "RBF06") return { card, error: false };
        }
        return { card: fakeCards.fakeCards[0], error: true };
    }

    const getCardById = (cardId: string) => {
        if(cardId === "playAmount" || cardId === "drawAmount"
        || cardId === "handLimit"  || cardId === "keeperLimit"
        || cardId === "location"   || cardId === "teleblock") return getFakeRuleCard(cardId).card;

        for(const card of allDeckData.allCards) {
            if(cardId === card.id) {
                return card;
            }
        }
        return allDeckData.allCards[0];
    }

    const getDeckCardById = (cardId: string, deck: CardSchema[]) => {
        for(let i = 0; i < deck.length; i++) {
            if(cardId === deck[i].id) return { state: deck[i], index: i };
        }
        return { state: deck[0], index: 0 };
    }

    const getInitRule = (key: string): number | string | boolean => {
        const startingRules: {[key: string]: number | string | boolean} = start_rules
        for(const rule in startingRules) {
            if(key === rule) return (startingRules[rule]);
        }
        return 0;
    }

    const resetCardCooldowns = (keepers: CardSchema[]) => {
        for(const keeper of keepers) {
            keeper.cooldown = false;
        }
        return keepers;
    }

    const removeAttachments = (keepers: CardSchema[]) => {
        for(const keeper of keepers) {
            if(keeper.attachment) {
                keepers.push(keeper.attachment);
                keeper.attachment = null;
            }
        }
        return keepers;
    }

    const seperateCreepersAndKeepers = (keepers: CardSchema[]) => {
        const creepers: CardSchema[]    = [];
        const nonCreepers: CardSchema[] = [];
        keepers.forEach((keeper) => {
            if(keeper.type === "CREEPER") creepers.push(keeper);
            else nonCreepers.push(keeper);
        });
        return {keepers: nonCreepers, creepers};
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
            if(!player.keepers) return;
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

    const checkIfWon = (players: PlayerSchema[], goal: CardSchema, location: string) => {
        const winner = {
            playerId: "",
            hasCreeper: false,
            bypassCreeper: false,
            hasWon: false, 
        }

        players.forEach((player) => {
            if(!player.keepers) return;
            const { hasWon, bypassCreeper } = compareKeepersToGoal(player.keepers, goal, location);
            
            if(hasWon) {
                player.keepers.forEach((keeper) => {
                    if(keeper.type === "CREEPER") winner.hasCreeper = true;
                });
                winner.hasWon = hasWon;
                winner.bypassCreeper = bypassCreeper;
                winner.playerId = player.user.uid;
            }
        });

        console.log(winner);

        return (
            (winner.playerId !== "")
            && (!winner.hasCreeper)
            || (winner.hasCreeper && winner.bypassCreeper) 
                ? winner.playerId 
                : false
        );
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
        if(!cards.length) return cards;
        const firstHalf = cards.slice(0, cardIndex);
        const lastHalf = cards.slice(cardIndex + 1);
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
        turnDispatch: React.Dispatch<TURN_ACTIONS>, 
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
        getPlayerKeeper,
        getCardById,
        getFakeRuleCard,
        getDeckCardById,
        getInitRule,
        seperateCreepersAndKeepers,
        chooseWhoGoesFirst,
        checkShouldDiscard,
        checkForCreepers,
        checkPlayersForKeeper,
        checkIfWon,
        drawPhase,
        removeCard,
        shuffleDeck,
        endTurn,
        turnReducer,
        goalReducer,
        rulesReducer,
        playerReducer,
        deckReducer,
    }
})();
