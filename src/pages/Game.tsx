import { useEffect, useState, useReducer, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from 'firebase/database';
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

const { 
    loadGame, 
    getPlayer, 
    connectGame, 
    chooseWhoGoesFirst,
    endTurn,
    upload,
    shuffleDeck,
    drawPhase,
} = gameFunctions;

const enum RULE_REDUCER_ACTIONS {
    INIT,
    RULE_CHANGE__DRAW,
    RULE_CHANGE__PLAY,
    RULE_CHANGE__KEEPER_LIMIT,
    RULE_CHANGE__HAND_LIMIT,
    RULE_CHANGE__LOCATION,
    RULE_CHANGE__TELEBLOCK,
}

type RULE_ACTIONS = {
    type: RULE_REDUCER_ACTIONS
    payload: {
        init? : RuleSchema,
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
    const { init, amount, location, teleblock } = action.payload;
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
            return Object.assign({}, state, {teleblock: teleblock ?? false})
        default: 
            return state;
    }
}

const enum DECK_REDUCER_ACTIONS {
    INIT,
    DECK_REPLACE__PURE,
    DECK_REMOVE__PURE_TOP,
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
        case DECK_REDUCER_ACTIONS.DECK_REMOVE__PURE_TOP:
            upload("DECK_PURE", db, {deckState: [...state.pure.slice(0, state.pure.length - (amount ?? 0))]}, gameId);
            return Object.assign({}, state, {pure: [...state.pure.slice(0, state.pure.length - (amount ?? 0))]})
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
    HAND_CARDS__ADD
}

type PLAYER_ACTIONS = {
    type: PLAYER_REDUCER_ACTIONS,
    payload: {
        playerId: string,
        init?: PlayerSchema[],
        cards?: CardSchema[],
        upload: {
            db: Database,
            gameId: string,
        }
    }
}

const playerReducer = (state: PlayerSchema[], action: PLAYER_ACTIONS) => {
    const { playerId, init, cards } = action.payload;
    const { db, gameId } = action.payload.upload;
    const players = [...state];
    const player = getPlayer(state, playerId);
    switch(action.type) {
        case PLAYER_REDUCER_ACTIONS.INIT:
            return init ? [...init] : [];
        case PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD:
            players[player.index] = Object.assign({}, player.state, {hand: [...player.state.hand, ...cards ?? []]})
            upload("PLAYER", db, {playersState: players, playerId}, gameId);
            return [...players]; 
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

    /*LOCAL STATE*/
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<CardSchema | null>(null);
    const [localPlayer, setLocalPlayer] = useState(getPlayer(table.players, user?.uid ?? '').state)

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
    ) => {
        if(!deckData.discard) deckData.discard = [];
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
        })
        setTable((prev) => ({...prev, round: roundData}));
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

    const selectCard = (card: CardSchema | null) => {
        setSelectedCard((prev) => {
            if(prev === null || card === null) return card;
            else return prev.name === card.name ? null : card;
        });
    }

    const drawCards = () => {
        const drawn = drawPhase(table);
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
                amount: drawn, 
                upload: uploadProps
            }
        });
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
                />
            )
        })
    }

    return (
        <div className='game_container' >
            <UserAccountBox />
            <div className='user_bars__container'>
                { mapPlayerBars() }
            </div>
            <GameRules 
                rules={table.rules}
            />
            {
            selectedCard 
            &&
            <PlayCard 
                cardState={selectedCard}
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
            localPlayer.hand.length
            ?
            <HandOfCards 
                selectCard={selectCard}
                hand={localPlayer.hand}
            />
            : null
            }
            {user &&
            table.turn.player === user?.uid
            &&
            <EndTurn 
                table={table}
                endTurn={endTurnHandler}
            />
            }
        </div>
    )
}