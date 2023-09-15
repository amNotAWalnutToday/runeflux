import { useEffect, useState, useReducer, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from 'firebase/database';
import start_rules from '../data/start_rules.json';
import UserContext from '../data/Context';
import GameSchema from '../schemas/gameSchema';
import CardSchema from '../schemas/cardSchema';
import RuleSchema from '../schemas/ruleSchema';
import TurnSchema from '../schemas/turnSchema';
import PlayerSchema from '../schemas/playerSchema';
import gameFunctions from '../utils/gameFunctions';
import roomFunctions from '../utils/roomFunctions';
import DrawCard from '../components/DrawCard';
import UserAccountBox from '../components/UserAccountBox';
import HandOfCards from '../components/HandOfCards';
import PlayCard from '../components/PlayCard';
import GameRules from '../components/GameRules';
import EndTurn from '../components/EndTurn';
import DeckSchema from '../schemas/deckSchema';
import Table from '../components/Table';
import Card from '../components/Card';
import InspectKeeper from '../components/InspectKeeper';
import Duel from '../components/Duel';

const { 
    loadGame, 
    getPlayer,
    getCardById,
    getInitRule, 
    connectGame, 
    chooseWhoGoesFirst,
    checkShouldDiscard,
    checkForCreepers,
    checkPlayersForKeeper,
    checkIfWon,
    endTurn,
    upload,
    uploadTable,
    shuffleDeck,
    drawPhase,
    removeCard,
} = gameFunctions;

const enum RULE_REDUCER_ACTIONS {
    INIT,
    RULE_CHANGE__DRAW,
    RULE_CHANGE__PLAY,
    RULE_CHANGE__KEEPER_LIMIT,
    RULE_CHANGE__HAND_LIMIT,
    RULE_CHANGE__LOCATION,
    RULE_CHANGE__LOCATION_RANDOM,
    RULE_CHANGE__TELEBLOCK,
    RULE_RESET__CHOICE,
    RULE_RESET__ALL,
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
    const locations = ["MISTHALIN", "ASGARNIA", "MORYTANIA", "ABYSS", "ENTRANA", "CRANDOR"];
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

const enum DECK_REDUCER_ACTIONS {
    INIT,
    DECK_REPLACE__PURE,
    DECK_REPLACE__DISCARD_TO_PURE,
    DECK_REMOVE__PURE_TOP,
    DECK_ADD__DISCARD_BOT,
}

type DECK_ACTIONS = {
    type: DECK_REDUCER_ACTIONS,
    payload: {
        init?: DeckSchema,
        pile: CardSchema[],
        amount?: number
        upload: {
            db: Database,
            gameId: string,
        }
    }
}

const deckReducer = (state: DeckSchema, action: DECK_ACTIONS) => {
    const { pile, amount, init } = action.payload;
    const { db, gameId } = action.payload.upload;
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
       case DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT:
            upload("DECK_DISCARD", db, {deckState: pile ? [...pile].concat([...state.discard]) : []}, gameId);
            return Object.assign({}, state, {discard: pile ? [...pile].concat([...state.discard]) :[]});
       default: 
            return state;
    }
}

const enum TURN_REDUCER_ACTION {
    INIT,
    CHANGE_TURN,
    DRAWN_ADD,
    PLAYED_ADD,
    TEMPORARY_HAND__BEGIN,
    TEMPORARY_HAND__END,
    TEMPORARY_HAND_CARD__ADD,
    TEMPORARY_HAND_CARD__REMOVE,
    TEMPORARY_PLAY_CHANGE,
    DUEL_BEGIN,
    DUEL_ROLL__PLAYER_1,
    DUEL_ROLL__PLAYER_2,
    DUEL_END,
    DUEL_COOLDOWN,
}

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

const enum PLAYER_REDUCER_ACTIONS {
    INIT,
    HAND_CARDS__ADD,
    HAND_CARDS__REMOVE,
    KEEPER_CARDS__ADD,
    KEEPER_CARDS__REMOVE,
    KEEPER_CARDS__EXCHANGE,
    KEEPER_COOLDOWN__SET,
    TRADE_HANDS,
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
            players[player.index] = Object.assign({}, player.state, {keepers: [...player.state.keepers, ...cards ?? []]});
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

const enum GOAL_REDUCER_ACTIONS {
    INIT,
    GOAL_REPLACE__SINGLE,
    GOAL_ADD__MULTI,
    GOAL_REPLACE__MULTI,
    GOAL_RESET
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

type Props = {
    setWinGameStats: React.Dispatch<React.SetStateAction<{
        winner: PlayerSchema | null;
        round: number;
        goal: CardSchema | null,
    }>>
}

export default function Game({setWinGameStats}: Props) {
    const { startGame, checkGameInProgress } = roomFunctions;

    const navigate = useNavigate();

    const { db, user, joinedGameID } = useContext(UserContext);
    const uploadProps = { db, gameId: joinedGameID }
    
    /*GLOBAL STATE*/
    const [table, setTable] = useState<GameSchema>(loadGame(user));
    const [rules, dispatchRules] = useReducer(rulesReducer, table.rules);
    const [deck, dispatchDeck] = useReducer(deckReducer, table.deck);
    const [turn, dispatchTurn] = useReducer(turnReducer, table.turn);
    const [players, dispatchPlayers] = useReducer(playerReducer, table.players);
    const [goal, dispatchGoal] = useReducer(goalReducer, table.goal);

    /*LOCAL STATE*/
    const [loading, setLoading] = useState(true);
    const [locationCooldown, setLocationCooldown] = useState(false);
    const [selectedCard, setSelectedCard] = useState<{state: CardSchema, index: number} | null>(null);
    const [inspectedKeeper, setInspectedKeeper] = useState<{state: CardSchema, index: number, playerIndex: number} | null>(null);
    const [selectedRuleGroup, setSelectedRuleGroup] = useState<string[]>([]);
    const [selectedPlayerGroup, setSelectedPlayerGroup] = useState<PlayerSchema[]>([]);
    const [selectedKeeperGroup, setSelectedKeeperGroup] = useState<{ state: CardSchema, index: number, playerIndex: number }[]>([]);
    const [selectedGoalGroup, setSelectedGoalGroup] = useState<{ state: CardSchema, index: number }[]>([]);
    const [localPlayer, setLocalPlayer] = useState(getPlayer(table.players, user?.uid ?? '').state)

    const selectCard = (card: { state: CardSchema, index: number } | null) => {
        setSelectedCard((prev) => {
            if(prev === null || card === null) return card;
            else return prev.state.name === card.state.name ? null : card;
        });
        if(inspectedKeeper) {
            setInspectedKeeper(() => null);
        }
    }

    const inspectKeeper = (card: { state: CardSchema, index: number, playerIndex: number } | null) => {
        setInspectedKeeper((prev) => {
            if(prev === null || card === null) return card;
            else return prev.state.name === card.state.name ? null : card;
        });
        if(selectedCard) {
            setSelectedCard(() => null);
        }
    }

    const resetGroups = (exception?: string) => {
        if(exception !== "KEEPERS") setSelectedKeeperGroup(() => []);
        if(exception !== "PLAYERS") setSelectedPlayerGroup(() => []);
        if(exception !== "RULES") setSelectedRuleGroup(() => []);
        if(exception !== "GOALS") setSelectedGoalGroup(() => []);
    }

    const selectRuleGroup = (rule: string) => {
        setSelectedRuleGroup((prev) => {
            if(prev.includes(rule)) return [];
            return [...prev, rule];
        });
        resetGroups("RULES");
    }

    const selectKeeperGroup = (keeper: { state: CardSchema, index: number, playerIndex: number }) => {
        setSelectedKeeperGroup((prev) => {
            for(const item of prev) {
                if(item.index === keeper.index && item.playerIndex === keeper.playerIndex) return [];
            }
            return [...prev, keeper];
        });
        resetGroups("KEEPERS");
    } 

    const selectPlayerGroup = (player: PlayerSchema) => {
        setSelectedPlayerGroup((prev) => {
            for(const p of prev) {
                if(p.user.uid === player.user.uid) return [];
            }
            return [...prev, player];
        });
        resetGroups("PLAYERS");
    }

    const selectGoalGroup = (goal: { state: CardSchema, index: number }) => {
        setSelectedGoalGroup((prev) => {
            for(const g of prev) {
                if(g.state.id === goal.state.id) return [];
            }
            return [...prev, goal];
        });
        resetGroups("GOALS");
    }

    useEffect(() => {
        setTable((prev) => {
            return { ...prev, rules }
        });
    }, [rules]);

    useEffect(() => {
        setTable((prev) => {
            return { ...prev, deck }
        });
    }, [deck]);

    useEffect(() => {
        if(table.isWon) {
            let winner = { state: {} as PlayerSchema, index: 0 };
            let goalWon: CardSchema | null = null;
            const winner1 = checkIfWon(players, goal[0], rules.location);
            const winner2 = goal.length > 1 ? checkIfWon(players, goal[1], rules.location) : null;
            if(winner1) winner = getPlayer(players, winner1);
            else if(winner2) winner = getPlayer(players, winner2);
            if(winner1) goalWon = goal[0];
            else if(winner2) goalWon = goal[1]

            setWinGameStats((prev) => {
                return { ...prev, winner: winner.state ?? null, round: table.round, goal: goalWon }
            });          
            navigate('/gameover');
        }
        setTable((prev) => {
            if(prev.turn.player !== turn.player) {
                setSelectedCard(() => null);
            }
            return { ...prev, turn }
        });
        /*eslint-disable-next-line*/
    }, [turn]);

    useEffect(() => {
        setTable((prev) => {
            return { ...prev, players }
        });
        setLocalPlayer((prev) => {
            return { ...prev, ...getPlayer(players, user?.uid ?? '').state }
        });
        const player = getPlayer(players, user?.uid ?? '');
        if(player.state.hand.length) {
            player.state.hand.forEach((card, ind) => {
                if(card.type === "CREEPER" && !table.pending) return playCard(card, ind);
            })
        }
        turn.temporary.hand.forEach((card, ind) => {
            if(card.type === "CREEPER" && !table.pending) playTemporaryCard(card, ind);
        });
        /*eslint-disable-next-line*/
    }, [players]);

    useEffect(() => {
        setTable((prev) => {
            return { ...prev, goal }
        });
    }, [goal]);

    useEffect(() => {
        if(!user) return navigate('/');
        if(!loading) return;
        tableInit();

        const escapeHandler = (e: KeyboardEvent) => {
            if(e.key === "Escape") {
                resetGroups();
                selectCard(null);
                inspectKeeper(null);
            } 
        }
        window.addEventListener("keydown", escapeHandler);
        return (() => window.removeEventListener("keydown", escapeHandler));
        /*eslint-disable-next-line*/
    }, []);

    const tableStateInit = (
        deckData: DeckSchema,
        goalData: CardSchema[],
        ruleData: RuleSchema,
        playerData: PlayerSchema[],
        turnData: TurnSchema,
        roundData: number,
        pendingData: CardSchema | false,
        counterData: CardSchema | false,
        winData: boolean,
    ) => {
        if(!deckData.discard) deckData.discard = [];
        if(!deckData.pure) deckData.pure = [];
        if(!goalData) goalData = [];
        for(const player of playerData) {
            if(!player.hand) player.hand = [];
            if(!player.keepers) player.keepers = [];
        }
        if(!turnData.temporary.hand) turnData.temporary.hand = [];

        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.INIT,
            payload: {
                init:  {...deckData},
                pile: {...deckData.pure},
                upload: uploadProps
            }
        });
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.INIT,
            payload: {
                init: [...playerData],
                playerId: playerData[0].user.uid,
                upload: uploadProps
            }
        });
        dispatchTurn({
            type: TURN_REDUCER_ACTION.INIT,
            payload: {
                init: {...turnData},
                upload: uploadProps
            }
        });
        dispatchRules({
            type: RULE_REDUCER_ACTIONS.INIT,
            payload: {
                init: {...ruleData},
                amount: 0,
                upload: uploadProps
            }
        });
        dispatchGoal({
            type: GOAL_REDUCER_ACTIONS.INIT,
            payload: {
                goals: [...goalData],
                upload: uploadProps
            }
        });
        setTable((prev) => ({...prev, round: roundData, pending: pendingData, counter: counterData, isWon: winData}));
        setLocalPlayer((prev) => {
            return { ...prev, ...getPlayer(playerData, user?.uid ?? '').state }
        });
    }

    const tableInit = async () => {
        if(!user) return navigate('/');
        await connectGame(joinedGameID, db, tableStateInit);
        if(user.uid === joinedGameID) {
            if(await checkGameInProgress(db, joinedGameID)) return;
            const firstTurn = chooseWhoGoesFirst(players);
            const updatedDeck = shuffleDeck(table.deck.pure);
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_REPLACE__PURE, 
                payload: {
                    pile: updatedDeck,
                    upload: {...uploadProps}
                }
            });
            dispatchTurn({
                type: TURN_REDUCER_ACTION.CHANGE_TURN, 
                payload: {
                    player: firstTurn,
                    upload: {...uploadProps},
                }
            });
            await startGame(db, joinedGameID);
        }
        setLoading(() => false);
    }

    const startDuel = (victimId: string, card: { state: CardSchema, index: number, playerIndex: number }) => {
        dispatchTurn({
            type: TURN_REDUCER_ACTION.DUEL_BEGIN,
            payload: {
                player: user?.uid, 
                victim: victimId,
                duelCard: card,
                upload: uploadProps
            }
        });
    }

    const rollForDuel = () => {
        const isPlayer1 = user?.uid === turn.duel.player1.id;
        dispatchTurn({
            type: (isPlayer1 
                ? TURN_REDUCER_ACTION.DUEL_ROLL__PLAYER_1
                : TURN_REDUCER_ACTION.DUEL_ROLL__PLAYER_2),
            payload: {
                upload: uploadProps,
            }
        })
    }

    const endDuel = (winnerId: string) => {
        if(winnerId === turn.duel.player1.id) {
            if(!turn.duel.card) return;
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                payload: {
                    playerId: winnerId,
                    cards: [turn.duel.card.state],
                    upload: uploadProps,
                }
            });
            const updatedKeepers = removeCard(players[turn.duel.card.playerIndex].keepers, turn.duel.card.index);
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                payload: {
                    playerId: players[turn.duel.card.playerIndex].user.uid,
                    cards: [...updatedKeepers],
                    upload: uploadProps
                }
            });
        }

        dispatchTurn({
            type: TURN_REDUCER_ACTION.DUEL_END,
            payload: {
                upload: uploadProps,
            }
        });
    }

    const drawCards = () => {
        const drawn = drawPhase(table);
        if(!deck.pure || deck.pure.length < rules.drawAmount) {
            const updatedDeck = shuffleDeck([...deck.pure, ...deck.discard]);
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_REPLACE__DISCARD_TO_PURE,
                payload: {
                    pile: [...updatedDeck],
                    upload: uploadProps
                }
            });
            return;
        }
        const creepers = checkForCreepers([...deck.pure.slice(deck.pure.length - drawn)]);
        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.DECK_REMOVE__PURE_TOP,
            payload: {
                pile: [],
                amount: drawn,
                upload: uploadProps
            }
        });
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
            payload: {
                playerId: user?.uid ?? '',
                cards: Array.from(deck.pure.slice(deck.pure.length - drawn)),
                upload: uploadProps
            }
        });
        if(creepers.length) return;
        dispatchTurn({
            type: TURN_REDUCER_ACTION.DRAWN_ADD, 
            payload: { 
                player: table.turn.player && table.turn.player !== true 
                    ? table.turn.player 
                    : 'a', 
                amount: turn.drawn + drawn, 
                upload: uploadProps
            }
        });
    }

    const drawCardsForPlayer = (playerId: string, amount: number, fromTop: number) => {
        const player = getPlayer(players, playerId);
        let updatedDeck = Array.from(deck.pure.slice(deck.pure.length - (amount + fromTop)));
        if(fromTop > 0) {
            const ud3 = removeCard(updatedDeck, updatedDeck.length - 1);
            let ud2;
            let ud1;
            if(fromTop > 1) {
                ud2 = removeCard(ud3, updatedDeck.length - 2);
                if(fromTop > 2) {
                    ud1 = removeCard(ud2, updatedDeck.length - 3);
                }
            }
            updatedDeck = ud1 ? ud1 : ud2 ? ud2 : ud3;
        }
        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.DECK_REMOVE__PURE_TOP,
            payload: {
                pile: [],
                amount,
                upload: uploadProps
            }
        });
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
            payload: {
                playerId: player.state.user.uid ?? '',
                cards: updatedDeck,
                upload: uploadProps
            }
        });
    }

    const wormhole = (playAmount = 1, discardAmount = 0) => {
        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.DECK_REMOVE__PURE_TOP,
            payload: {
                pile: [],
                amount: playAmount,
                upload: uploadProps,
            }
        })
        dispatchTurn({
            type: TURN_REDUCER_ACTION.TEMPORARY_HAND__BEGIN,
            payload: {
                cards: [...deck.pure.slice(deck.pure.length - (playAmount + discardAmount))],
                amount: playAmount,
                upload: uploadProps
            }
        });
    }
    
    const discardCardFromHand = (cardIndex: number, addToDiscard = true) => {
        const updatedHand = removeCard(localPlayer.hand, cardIndex);
        if(addToDiscard){
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [localPlayer.hand[cardIndex]],
                    upload: uploadProps
                }
            });
        }

        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__REMOVE,
            payload: {
                playerId: user?.uid ?? '',
                cards: [...updatedHand],
                upload: uploadProps
            }
        });
        setSelectedCard(() => null);
    }

    const discardTemporaryCard = (cardIndex: number, addToDiscard = true) => {
        if(!turn.temporary) return;
        const { hand } = turn.temporary;
        const updatedHand = removeCard(hand, cardIndex);
        if(addToDiscard) {
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [hand[cardIndex]],
                    upload: uploadProps
                }
            });
        }

        dispatchTurn({
            type: TURN_REDUCER_ACTION.TEMPORARY_HAND_CARD__REMOVE,
            payload: {
                cards: [...updatedHand],
                upload: uploadProps
            }
        });

        setSelectedCard(() => null);
    }

    const discardCardFromPlayer = (cardIndex: number, playerId: string) => {
        const player = getPlayer(players, playerId);
        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
            payload: {
                pile: [player.state.hand[cardIndex]],
                upload: uploadProps
            }
        });

        const updatedHand = removeCard(player.state.hand, cardIndex);
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__REMOVE,
            payload: {
                playerId,
                cards: [...updatedHand],
                upload: uploadProps
            }
        })

        setSelectedCard(() => null);
    }

    const discardKeeper = (cardIndex: number, addToDiscard = true) => {
        const updatedKeepers = removeCard(localPlayer.keepers, cardIndex);
        if(addToDiscard) {
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [localPlayer.keepers[cardIndex]],
                    upload: uploadProps
                }
            });
        }

        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
            payload: {
                playerId: user?.uid ?? '',
                cards: [...updatedKeepers],
                upload: uploadProps
            }
        });
        setInspectedKeeper(() => null);
    }

    const resetPending = () => {
        upload('PENDING', db, {cardState: false}, joinedGameID);
    }

    const playCard = (card: CardSchema | false, indexInHand: number) => {
        if(!card) return;
        if(card.subtype === "LOCATION" && rules.teleblock) return;
        const prevPending = table.pending ?? null;
        if(turn.player !== user?.uid) {
            upload("COUNTER", db, {cardState: card}, joinedGameID);
            discardCardFromHand(indexInHand, checkShouldDiscard(card.type));
            return resolvePlayCard(card, prevPending);
        }
        upload('PENDING', db, {cardState: card}, joinedGameID);
        if(indexInHand > -1) discardCardFromHand(indexInHand, checkShouldDiscard(card.type));
        if(turn.player === user?.uid
        && card.type !== "CREEPER"
        && indexInHand > -1) {
            dispatchTurn({
                type: TURN_REDUCER_ACTION.PLAYED_ADD,
                payload: {
                    amount: turn.played + 1,
                    upload: uploadProps
                }
            });
        }
        resolvePlayCard(card, prevPending);
    }

    const playTemporaryCard = (card: CardSchema | false, indexInHand: number) => {
        if(!card || !table.turn.temporary) return;
        if(card.subtype === "LOCATION" && rules.teleblock) return;
        const prevPending = table.pending ?? null;
        upload('PENDING', db, {cardState: card}, joinedGameID);
        discardTemporaryCard(indexInHand, checkShouldDiscard(card.type));
        if(turn.player === user?.uid) {
            dispatchTurn({
                type: TURN_REDUCER_ACTION.TEMPORARY_PLAY_CHANGE,
                payload: {
                    amount: table.turn.temporary.play - 1,
                    upload: uploadProps
                }
            });
        }
        resolvePlayCard(card, prevPending);
    }

    const resolvePlayCard = (card: CardSchema, prevPending: typeof table.pending | null) => {
        setTimeout(() => {
            resetPending();
            switch(card.type) {
                case "KEEPER":
                    return playKeeperCard(card);
                case "RULE":
                    return playRuleCard(card);
                case "GOAL":
                    return playGoalCard(card);
                case "ACTION":
                    return playActionCards(card);
                case "COUNTER":
                    return playCounterCard(card, prevPending);
                case "CREEPER":
                    return playCreeperCard(card);
            }
            resetGroups();
        }, 3000);
    }

    const attachCreeper = (keeper: { state: CardSchema, index: number }) => {
        const thisPlayer = getPlayer(players, user?.uid ?? '');
        const updatedKeepers = removeCard([...thisPlayer.state.keepers], keeper.index);
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
            payload: {
                playerId: user?.uid ?? '',
                cards: [...updatedKeepers],
                upload: uploadProps
            }
        });
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
            payload: {
                playerId: user?.uid ?? '',
                cards: [keeper.state],
                upload: uploadProps
            }
        });
    }

    const playCreeperCard = (card: CardSchema) => {
        const thisPlayer = getPlayer(players, user?.uid ?? '');
        if(card.subtype === "LIVING_CREEPER") {
            let livingKeeper: {state: CardSchema, index: number} | undefined;
            thisPlayer.state.keepers.forEach((keeper, index) => {
                if(keeper.subtype === "LIVING"
                && !keeper.attachment         ) livingKeeper = {state: {...keeper}, index};
            });
            if(!livingKeeper) return playKeeperCard(card);
            livingKeeper.state.attachment = card;
            attachCreeper(livingKeeper);
        } else if(card.subtype === "EQUIPMENT_CREEPER") {
            let equipmentKeeper: {state: CardSchema, index: number} | undefined;
            thisPlayer.state.keepers.forEach((keeper, index) => {
                if(keeper.subtype === "EQUIPMENT"
                && !keeper.attachment             ) equipmentKeeper = { state: {...keeper}, index };
            });
            if(!equipmentKeeper) return playKeeperCard(card);
            equipmentKeeper.state.attachment = card;
            attachCreeper(equipmentKeeper);
        }
    }

    const playCounterCard = (card: CardSchema, prevPending: typeof table.pending | null) => {
        const isYourTurn = user?.uid === turn.player;
        if(card.effects.includes("TELESTOP_OR_LOCATION_MISTHALIN")) {
            if(isYourTurn) {
                dispatchRules({
                    type: RULE_REDUCER_ACTIONS.RULE_CHANGE__LOCATION,
                    payload: {
                        location: "MISTHALIN",
                        upload: uploadProps
                    }
                });
            } else {
                upload("RULE", db, {ruleState: rules}, joinedGameID);
            }
        } else if(card.effects.includes("GOALSTOP_OR_GOALS_NONE")) {
            if(isYourTurn) {
                dispatchGoal({
                    type: GOAL_REDUCER_ACTIONS.GOAL_RESET,
                    payload: { goals: [], upload: uploadProps }
                });
            } else {
                upload("GOAL", db, {goalState: goal}, joinedGameID);
            }
        } else if(card.effects.includes("ACTIONSTOP_OR_DISCARD_1_ALL")) {
            if(isYourTurn) {
                players.forEach((player) => {
                    const cardToDiscard = Math.floor(Math.random() * player.hand.length);
                    discardCardFromPlayer(cardToDiscard, player.user.uid);
                });
            } else {
                uploadTable(db, table, joinedGameID);
                upload("PENDING", db, {cardState: false}, joinedGameID);
            }
        } else if(card.effects.includes("KEEPER_STEALSTOP_OR_KEEPER_STEAL")) {
            if(isYourTurn) {
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                    payload: {
                        playerId: user.uid,
                        cards: [selectedKeeperGroup[0].state],
                        upload: uploadProps,
                    }
                });
                const updatedKeepers = removeCard(players[selectedKeeperGroup[0].playerIndex].keepers, selectedKeeperGroup[0].index);
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                    payload: {
                        playerId: players[selectedKeeperGroup[0].playerIndex].user.uid,
                        cards: [...updatedKeepers],
                        upload: uploadProps
                    }
                });
            } else {
                uploadTable(db, table, joinedGameID);
                upload("PENDING", db, {cardState: false}, joinedGameID);
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                    payload: {
                        playerId: user?.uid ?? '',
                        cards: prevPending && prevPending !== true ? [prevPending] : [],
                        upload: uploadProps
                    }
                });
            }
        } else if(card.effects.includes("RULESTOP_OR_RULE_RESET_2")) {
            if(isYourTurn) {
                const selectedAmount = selectedRuleGroup.length > 2 ? 2 : 1;
                for(let i = 0; i <= selectedAmount; i++) {
                    dispatchRules({
                        type: RULE_REDUCER_ACTIONS.RULE_RESET__CHOICE,
                        payload: {
                            ruleKey: selectedRuleGroup[i],
                            upload: uploadProps
                        }
                    });
                }
            } else {
                upload("RULE", db, {ruleState: rules}, joinedGameID);
            }
        } else if(card.effects.includes("KEEPER_DISCARD_REFLECT_OR_KEEPER_DISCARD")) {
            if(isYourTurn) {
                const updatedKeepers = removeCard(players[selectedKeeperGroup[0].playerIndex].keepers, selectedKeeperGroup[0].index);
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                    payload: {
                        playerId: players[selectedKeeperGroup[0].playerIndex].user.uid,
                        cards: [...updatedKeepers],
                        upload: uploadProps
                    }
                });
            } else {
                uploadTable(db, table, joinedGameID);
                upload("PENDING", db, {cardState: false}, joinedGameID);
                const playerWhoGotCountered = getPlayer(players, turn.player !== true && turn.player ? turn.player : '');
                const randomCardIndex = Math.floor(Math.random() * playerWhoGotCountered.state.keepers.length);
                const updatedKeepers = removeCard(playerWhoGotCountered.state.keepers, randomCardIndex);
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                    payload: {
                        playerId: playerWhoGotCountered.state.user.uid,
                        cards: [...updatedKeepers],
                        upload: uploadProps,
                    }
                });
            }
        }
        upload("COUNTER", db, {cardState: false}, joinedGameID);
        resetGroups();
    }

    const playKeeperCard = (card: CardSchema) => {
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
            payload: {
                playerId: user?.uid ?? '',
                cards: [card],
                upload: uploadProps
            }
        });
    }

    const playGoalCard = (card: CardSchema) => {
        const newGoals = [];
        newGoals.push(card);
        if((goal.length && rules.location !== "ASGARNIA"    ) 
        || (rules.location === "ASGARNIA" && goal.length > 1)) {
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [goal[selectedGoalGroup[0]?.index ?? 0]],
                    upload: uploadProps
                }
            });
        }
        if(rules.location === "ASGARNIA") {
            dispatchGoal({
                type: goal.length < 2 
                    ? GOAL_REDUCER_ACTIONS.GOAL_ADD__MULTI 
                    : GOAL_REDUCER_ACTIONS.GOAL_REPLACE__MULTI,
                payload: {
                    replaceIndex: selectedGoalGroup[0]?.index ?? 0,
                    goals: newGoals,
                    upload: uploadProps
                } 
            });
        } else {
            dispatchGoal({
                type: GOAL_REDUCER_ACTIONS.GOAL_REPLACE__SINGLE,
                payload: {
                    goals: newGoals,
                    upload: uploadProps
                } 
            });
        }
        resetGroups();
    }

    const playRuleCard = (card: CardSchema) => {
        if(card.effects.includes("RULE_PLAY")) {
            const amount = card.effects[1];
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__PLAY,
                payload: {
                    amount: Number(amount),
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("RULE_DRAW")) {
            const amount = card.effects[1];
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__DRAW,
                payload: {
                    amount: Number(amount),
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("RULE_HAND_LIMIT")) {
            const amount = card.effects[1];
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__HAND_LIMIT,
                payload: {
                    amount: Number(amount),
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("RULE_KEEPER_LIMIT")) {
            const amount = card.effects[1];
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__KEEPER_LIMIT,
                payload: {
                    amount: Number(amount),
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("LOCATION")) {
            const location = card.effects[1];
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__LOCATION,
                payload: {
                    location,
                    upload: uploadProps
                }
            });
            if(location === "ENTRANA") entranaHandler();
        } else if(card.effects.includes("TELEBLOCK")) {
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__TELEBLOCK,
                payload: {
                    teleblock: true,
                    upload: uploadProps,
                }
            });
        }
        resetGroups();
    }

    const entranaHandler = () => {
        players.forEach((player) => {
            let keepers = [...player.keepers];
            player.keepers.forEach((keeper, index) => {
                if(keeper.subtype === "RUNE" || keeper.subtype === "EQUIPMENT") {
                    keepers = removeCard(keepers, index);    
                }
            });
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                payload: {
                    playerId: player.user.uid,
                    cards: [...keepers],
                    upload: uploadProps
                }
            });
        });
    }

    const playActionCards = (card: CardSchema) => {
        if(card.effects.includes("RULES_RESET")) {
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_RESET__ALL,
                payload: {
                    upload: uploadProps,
                }
            });
        } else if(card.effects.includes("LOCATION_RANDOM")) {
            teleport();
        } else if(card.effects.includes("RULE_RESET_CHOOSE")) {
            for(let i = 0; i <= (card.effects.length > 1 ? 2 : 0); i++) {
                dispatchRules({
                    type: RULE_REDUCER_ACTIONS.RULE_RESET__CHOICE,
                    payload: {
                        ruleKey: selectedRuleGroup[i],
                        upload: uploadProps
                    }
                });
            }
        } else if(card.effects.includes("TRADE_HANDS")) {
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.TRADE_HANDS,
                payload: {
                    playerId: user?.uid ?? "",
                    targetPlayerId: selectedPlayerGroup[0].user.uid,
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("KEEPERS_TO_HAND")) {
            players.forEach((player) => {
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
                    payload: {
                        playerId: player.user.uid,
                        cards: [...player.keepers.slice(0)],
                        upload: uploadProps
                    }
                });
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                    payload: {
                        playerId: player.user.uid,
                        cards: [],
                        upload: uploadProps
                    }
                });
            });
        } else if(card.effects.includes("KEEPER_EXCHANGE_CHOOSE")) {
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__EXCHANGE,
                payload: {
                    playerId: "",
                    keepersToExchange: [...selectedKeeperGroup.slice(0, 2)], 
                    cards: [selectedKeeperGroup[0].state, selectedKeeperGroup[1].state],
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("KEEPER_STEAL_CHOOSE")) {
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                payload: {
                    playerId: user?.uid ?? "",
                    cards: [selectedKeeperGroup[0].state],
                    upload: uploadProps
                }
            });
            const updatedKeepers = removeCard(players[selectedKeeperGroup[0].playerIndex].keepers, selectedKeeperGroup[0].index);
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                payload: {
                    playerId: players[selectedKeeperGroup[0].playerIndex].user.uid,
                    cards: updatedKeepers,
                    upload: uploadProps
                }
            })
        } else if(card.effects.includes("DRAW_2_PLAY_2")) {
            wormhole(2);
        } else if(card.effects.includes("DRAW_5_PLAY_3")) {
            wormhole(3, 2);
        } else if(card.effects.includes("DRAW_3_PLAY_2")) {
            wormhole(2, 1);
        } else if(card.effects.includes("DISCARD_1")) {
            players.forEach((player) => {
                const cardToDiscard = Math.floor(Math.random() * player.hand.length);
                discardCardFromPlayer(cardToDiscard, player.user.uid);
            });
        } else if(card.effects.includes("DRAW_1")) {
            players.forEach((player, index) => {
                drawCardsForPlayer(player.user.uid, 1, index);
            });
        } else if(card.effects.includes("DESTROY_1")) {
            const keepers = removeCard(players[selectedKeeperGroup[0].playerIndex].keepers, selectedKeeperGroup[0].index);
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                payload: {
                    playerId: players[selectedKeeperGroup[0].playerIndex].user.uid,
                    cards: [...keepers], 
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("STEAL_RUNE_CROSSBOW")) {
            const keeper = checkPlayersForKeeper(players, "KE04");
            if(!keeper.keeper) return;
            const updatedKeepers = removeCard(players[keeper.playerIndex].keepers, keeper.index);
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                payload: {
                    playerId: players[keeper.playerIndex].user.uid,
                    cards: updatedKeepers,
                    upload: uploadProps
                }
            });
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                payload: {
                    playerId: user?.uid ?? '',
                    cards: [keeper.keeper],
                    upload: uploadProps,
                }
            });
        } else if(card.effects.includes("SUMMON_GHOST")) {
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                payload: {
                    playerId: user?.uid ?? '',
                    cards: [getCardById("KL02")],
                    upload: uploadProps
                }
            });
        } 
        resetGroups();
    }

    const teleport = () => {
        dispatchRules({
            type: RULE_REDUCER_ACTIONS.RULE_CHANGE__LOCATION_RANDOM,
            payload: {
                upload: uploadProps
            }
        });  
    }

    const playKeeperEffect = (keeperId: string, keeperIndex: number) => {
        const thisPlayer = getPlayer(players, user?.uid ?? '');
        if(keeperId === "KL06") {
            const discardOrDraw = Math.ceil(Math.random() * 2);
            const amount = Math.ceil(Math.random() * 2);
            if(discardOrDraw === 1) {
                drawCardsForPlayer(thisPlayer.state.user.uid, amount, 0);
            }
            else {
                for(let i = 0; i < amount; i++) { 
                    discardCardFromHand(Math.floor(Math.random() * thisPlayer.state.hand.length));
                }
            }
        } else if(keeperId === "K01") {
            drawCardsForPlayer(thisPlayer.state.user.uid, 1, 0);
        } else if(keeperId === "CR01") {
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__LOCATION,
                payload: {
                    location: "CRANDOR",
                    upload: uploadProps,
                }
            });
        } else if(keeperId === "KR08") {
            teleport();
        } else if(keeperId === "KR02") {
            wormhole(1, 0);
        } else if(keeperId === "KE05") {
            const ran = Math.floor(Math.random() * selectedPlayerGroup[0].hand.length);
            const card = selectedPlayerGroup[0].hand[ran];
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
                payload: {
                    playerId: user?.uid ?? '',
                    cards: [card],
                    upload: uploadProps
                }
            });
            const updatedHand = removeCard(selectedPlayerGroup[0].hand, ran);
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__REMOVE,
                payload: {
                    playerId: selectedPlayerGroup[0].user.uid,
                    cards: [...updatedHand],
                    upload: uploadProps
                }
            });
        } else if(keeperId === "KL07" || keeperId === "KR07" || keeperId === "KE04") {
            playCard({
                "id": "AF01",
                "type": "ACTION",
                "subtype": "",
                "name": "DESTROY",
                "effects": ["DESTROY_1"],
                "text": "DESTROY!"
            }, -1);
        } else if(keeperId === "KL10") {
            playCard({
                "id": "AF02",
                "type": "ACTION",
                "subtype": "",
                "name": "STEAL RCB",
                "effects": ["STEAL_RUNE_CROSSBOW"],
                "text": "STEAL!, STEAL!, STEAL!"
            }, -1);
        } else if(keeperId === "KE01") {
            playCard(getCardById("A14"), -1);
        }

        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_COOLDOWN__SET,
            payload: {
                playerId: user?.uid ?? '',
                cooldown: true,
                cardIndex: keeperIndex,
                upload: uploadProps
            }
        });
        resetGroups();
        inspectKeeper(null);
    }

    const warp = () => {
        const warper = checkPlayersForKeeper(players, "KL12");
        if(!warper.keeper) return;
        const ran = Math.floor(Math.random() * players.length);
        if(ran === warper.playerIndex) return;
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
            payload: {
                playerId: players[ran].user.uid,
                cards: [warper.keeper],
                upload: uploadProps
            }
        });
        const updatedKeepers = removeCard(players[warper.playerIndex].keepers, warper.index);
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
            payload: {
                playerId: players[warper.playerIndex].user.uid,
                cards: [...updatedKeepers],
                upload: uploadProps
            }
        });
    }

    const isTurn = () => {
        if(user?.uid === turn.player) return true;
        return false;
    }

    const endTurnHandler = () => {
        if(goal.length) win();

        warp();
        setLocationCooldown(() => false);

        const thisPlayer = getPlayer(players, user?.uid ?? '');
        if(rules.location === "CRANDOR") {
            const ran = Math.floor(Math.random() * thisPlayer.state.hand.length);
            discardCardFromHand(ran, true);
        }
        if(rules.location === "MORYTANIA") {
            const chance = Math.floor(Math.random() * 101);
            if(chance <= 20) {
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                    payload: {
                        playerId: user?.uid ?? '',
                        cards: [getCardById("KL02")],
                        upload: uploadProps,
                    }
                });
            }
        }
        if(turn.duel.cooldown) {
            dispatchTurn({
                type: TURN_REDUCER_ACTION.DUEL_COOLDOWN,
                payload: { upload: uploadProps }
            });
        }
        
        thisPlayer.state.keepers.forEach((keeper, ind) => {
            if(keeper.cooldown) {
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_COOLDOWN__SET,
                    payload: {
                        playerId: user?.uid ?? '',
                        cooldown: false,
                        cardIndex: ind,
                        upload: uploadProps
                    }
                })
            } 
        });

        const isEndOfRound = endTurn(db, table.players, table.turn, dispatchTurn, joinedGameID);
        if(isEndOfRound) {
            setTable((prev) => ({...prev, round: prev.round++}));
            upload("ROUND", db, {roundState: table.round + 1}, joinedGameID);
        }
    }

    const win = () => {
        const goal1Winner = checkIfWon(players, goal[0], rules.location);
        let goal2Winner;
        if(rules.location === "ASGARNIA") {
            goal2Winner = checkIfWon(players, goal[1], rules.location);
        }

        if(goal1Winner || goal2Winner) {
            upload('WIN', db, {}, joinedGameID);
        } 
    }

    const mapPlayerBars = () => {
        return table.players.map((player: PlayerSchema, ind: number) => {
            return (
                <UserAccountBox 
                    key={`player_bar__${ind}`}
                    isSideBox={true}
                    player={player}
                    isTurn={table.turn.player === player.user.uid}
                    selectedPlayerGroup={selectedPlayerGroup}
                    selectPlayerGroup={selectPlayerGroup}
                />
            )
        })
    }

    return (
        <div className='game_container' >
            <button
                className='menu_link'
                onClick={() => {
                    // playActionCards({effects: ["RULE_RESET_CHOOSE"]} as CardSchema);
                    // playActionCards({effects: ["TRADE_HANDS"]} as CardSchema);
                    // playActionCards({effects: ["KEEPERS_TO_HAND"]} as CardSchema);
                    // playActionCards({effects: ["KEEPER_EXCHANGE_CHOOSE"]} as CardSchema);
                    // playActionCards({effects: ["KEEPER_STEAL_CHOOSE"]} as CardSchema);
                    // playActionCards({effects: ["DRAW_2_PLAY_2"]} as CardSchema);
                    // playActionCards({effects: ["DRAW_3_PLAY_2"]} as CardSchema);
                    // playActionCards({effects: ["DISCARD_1"]} as CardSchema);
                    // playActionCards({effects: ["DRAW_1"]} as CardSchema);
                    dispatchPlayers({
                        type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
                        payload: {
                            playerId: user?.uid ?? '',
                            cards: [         {
                                "id": "KR02",
                                "type": "KEEPER",
                                "subtype": "RUNE",
                                "name": "Chaos Rune",
                                "effects": ["WORMHOLE"],
                                "text": "Once per turn, choose to draw 1 and play it."
                            },{
                                "id": "RL02",
                                "type": "RULE",
                                "subtype": "LOCATION",
                                "name": "Abyss",
                                "effects": ["LOCATION", "ABYSS"],
                                text: "",
                        },        {
                            "id": "G31",
                            "type": "GOAL",
                            "subtype": "",
                            "name": "Chaos",
                            "effects": [],
                            "text": "Collection Type: |Abyss|, |Chaos Rune|"
                        },],
                            upload: uploadProps
                        }
                    });
                    // playCard(        {
                    //     "id": "RL02",
                    //     "type": "RULE",
                    //     "subtype": "LOCATION",
                    //     "name": "Abyss",
                    //     "effects": ["LOCATION", "ABYSS"],
                    //     "text": "When this card is in play, each player has to discard down to 1 card to end their turn."
                    // }, -1);
                    
                }}
            >
                action card function test
            </button>
            {   
                // !loading
                // &&
                <Table 
                    table={table}
                    inspectKeeper={inspectKeeper}
                    selectKeeperGroup={selectKeeperGroup}
                    selectedKeeperGroup={selectedKeeperGroup}
                    selectGoalGroup={selectGoalGroup}
                    selectedGoalGroup={selectedGoalGroup}
                />
            }
            <UserAccountBox />
            <div className='user_bars__container'>
                { mapPlayerBars() }
            </div>
            <GameRules 
                rules={table.rules}
                selectRuleGroup={selectRuleGroup}
                selectedRuleGroup={selectedRuleGroup}
                wormhole={wormhole}
                isTurn={isTurn()}
                cooldown={locationCooldown}
                setCooldown={setLocationCooldown}
            />
            {
                turn.duel.player1.id
                &&
                turn.duel.player2.id
                &&
                <Duel
                    turn={turn}
                    players={players}
                    rollForDuel={rollForDuel}
                    endDuel={endDuel}
                />
            }
            {
            user?.uid === table.turn.player
            && table.turn.drawn < table.rules.drawAmount
            &&
            <DrawCard 
                drawCards={drawCards}
            />
            }
            {
            selectedCard 
            &&
            <PlayCard 
                cardState={selectedCard}
                table={table}
                localPlayer={localPlayer}
                playCard={turn.temporary.hand.length ? playTemporaryCard : playCard }
                discardCard={turn.temporary.hand.length ? discardTemporaryCard : discardCardFromHand}
                fromWormhole={turn.temporary.hand.length ? true : false}
            />
            }
            {
                inspectedKeeper
                &&
                <InspectKeeper
                    cardState={inspectedKeeper}
                    table={table}
                    localPlayer={localPlayer}
                    playEffect={playKeeperEffect}
                    startDuel={startDuel}
                    discardKeeper={discardKeeper}
                    inspectKeeper={inspectKeeper}
                    selectedKeeperGroup={selectedKeeperGroup}
                    selectedPlayerGroup={selectedPlayerGroup}
                />
            }
            {
            (localPlayer.hand.length && !turn.temporary.hand.length)
            || !isTurn()
            ?
            <HandOfCards 
                selectCard={selectCard}
                hand={localPlayer.hand}
            />
            : null
            }
            {
                turn.temporary.hand.length > 0
                &&
                isTurn()
                &&
                <HandOfCards
                    selectCard={selectCard}
                    hand={turn.temporary.hand}
                />
            }
            <EndTurn 
                table={table}
                localPlayer={localPlayer}
                endTurn={endTurnHandler}
            />
            {
                table.pending !== false 
                &&
                table.pending !== true
                &&
                <Card 
                    position={"PENDING"}
                    cardState={{state:  table.pending , index: 0}}
                />
            }
            {
                table.counter !== false
                && 
                table.counter !== true
                &&
                <Card
                    position={"PENDING"}
                    cardState={{state: table.counter, index: 0}}
                />
            }
        </div>
    )
}