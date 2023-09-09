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

const { 
    loadGame, 
    getPlayer,
    getInitRule, 
    connectGame, 
    chooseWhoGoesFirst,
    checkShouldDiscard,
    endTurn,
    upload,
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
    PLAYED_ADD
}

type TURN_ACTIONS = {
    type: TURN_REDUCER_ACTION,
    payload: {
        init?: TurnSchema,
        player?: string,
        amount?: number,
        upload: {
            db: Database,
            gameId: string,
        }
    }
}

const turnReducer = (state: TurnSchema, action: TURN_ACTIONS) => {
    const { player, amount, init } = action.payload;
    const { db, gameId } = action.payload.upload; 

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
        upload: {
            db: Database,
            gameId: string,
        }
    }
}

const playerReducer = (state: PlayerSchema[], action: PLAYER_ACTIONS) => {
    const { playerId, init, cards, targetPlayerId, keepersToExchange } = action.payload;
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
}

type GOAL_ACTIONS = {
    type: GOAL_REDUCER_ACTIONS,
    payload: {
        goals: CardSchema[],
        upload: {
            db: Database,
            gameId: string,
        }
    }
}

const goalReducer = (state: CardSchema[], action: GOAL_ACTIONS) => {
    const { goals } = action.payload;
    const { db, gameId } = action.payload.upload;

    switch(action.type) {
        case GOAL_REDUCER_ACTIONS.INIT:
            return goals ? [...goals] : [];
        case GOAL_REDUCER_ACTIONS.GOAL_REPLACE__SINGLE:
            upload("GOAL", db, {goalState: goals?.length ? [...goals] : []}, gameId);
            return [...goals]; 
        
        default:
            return state;
    }
}

export default function Game() {
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
    const [selectedCard, setSelectedCard] = useState<{state: CardSchema, index: number} | null>(null);
    const [inspectedKeeper, setInspectedKeeper] = useState<{state: CardSchema, index: number} | null>(null);
    const [selectedRuleGroup, setSelectedRuleGroup] = useState<string[]>([]);
    const [selectedPlayerGroup, setSelectedPlayerGroup] = useState<PlayerSchema[]>([]);
    const [selectedKeeperGroup, setSelectedKeeperGroup] = useState<{ state: CardSchema, index: number, playerIndex: number }[]>([]);
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

    const inspectKeeper = (card: { state: CardSchema, index: number } | null) => {
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
        setTable((prev) => {
            if(prev.turn.player !== turn.player) {
                setSelectedCard(() => null);
            }
            return { ...prev, turn }
        });
    }, [turn]);

    useEffect(() => {
        setTable((prev) => {
            return { ...prev, players }
        });
        setLocalPlayer((prev) => {
            return { ...prev, ...getPlayer(players, user?.uid ?? '').state }
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
    ) => {
        if(!deckData.discard) deckData.discard = [];
        if(!deckData.pure) deckData.pure = [];
        if(!goalData) goalData = [];
        for(const player of playerData) {
            if(!player.hand) player.hand = [];
            if(!player.keepers) player.keepers = [];
        }

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
        setTable((prev) => ({...prev, round: roundData, pending: pendingData}));
        setLocalPlayer((prev) => {
            return { ...prev, ...getPlayer(playerData, user?.uid ?? '').state }
        });
    }

    const tableInit = async () => {
        if(!user) return navigate('/');
        await connectGame(joinedGameID, db, tableStateInit);
        if(user.uid === joinedGameID) {
            if(await checkGameInProgress(db, joinedGameID)) return;
            const firstTurn = chooseWhoGoesFirst(table.players);
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
        })
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
        upload('PENDING', db, {cardState: card}, joinedGameID);
        discardCardFromHand(indexInHand, checkShouldDiscard(card.type));
        dispatchTurn({
            type: TURN_REDUCER_ACTION.PLAYED_ADD,
            payload: {
                amount: turn.played + 1,
                upload: uploadProps
            }
        });

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
            }
            resetGroups();
        }, 1000);
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
        dispatchGoal({
            type: GOAL_REDUCER_ACTIONS.GOAL_REPLACE__SINGLE,
            payload: {
                goals: newGoals,
                upload: uploadProps
            } 
        });
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
        } else if(card.effects.includes("TELEBLOCK")) {
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__TELEBLOCK,
                payload: {
                    teleblock: true,
                    upload: uploadProps,
                }
            });
        }
    }

    const playActionCards = (card: CardSchema) => {
        if(card.effects.includes("RULES_RESET")) {
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_RESET__ALL,
                payload: {
                    upload: uploadProps,
                }
            });
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
        }
    }

    const endTurnHandler = () => {
        const isEndOfRound = endTurn(db, table.players, table.turn, dispatchTurn, joinedGameID);
        if(isEndOfRound) {
            setTable((prev) => ({...prev, round: prev.round++}));
            upload("ROUND", db, {roundState: table.round + 1}, joinedGameID);
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
                    playActionCards({effects: ["KEEPER_STEAL_CHOOSE"]} as CardSchema);
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
            />
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
                playCard={playCard}
                discardCard={discardCardFromHand}
            />
            }
            {
                inspectedKeeper
                &&
                <InspectKeeper
                    cardState={inspectedKeeper}
                    discardKeeper={discardKeeper}
                />
            }
            {
            localPlayer.hand.length
            ?
            <HandOfCards 
                selectCard={selectCard}
                hand={localPlayer.hand}
            />
            : null
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
        </div>
    )
}