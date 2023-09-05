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
    RULE_CHANGE__DRAW,
    RULE_CHANGE__PLAY,
    RULE_CHANGE__KEEPER_LIMIT,
    RULE_CHANGE__HAND_LIMIT,
    RULE_CHANGE__LOCATION,
    RULE_CHANGE__TELEBLOCK,
}

type RULE_ACTIONS = {
    type: RULE_REDUCER_ACTIONS
    payload?: {
        amount: number
    },
}

const rulesReducer = (state: RuleSchema, action: RULE_ACTIONS) => {
    switch(action.type) {
        case RULE_REDUCER_ACTIONS.RULE_CHANGE__DRAW: 
            return Object.assign({}, state, {drawAmount: action.payload?.amount})
        default: 
            return state;
    }
}

const enum DECK_REDUCER_ACTIONS {
    DECK_REPLACE__PURE,
    DECK_REMOVE__PURE_TOP,
}

type DECK_ACTIONS = {
    type: DECK_REDUCER_ACTIONS,
    payload: {
        pile: CardSchema[],
        amount?: number
        upload: {
            db: Database,
            gameId: string,
        }
    }
}

const deckReducer = (state: {pure: CardSchema[], discard: CardSchema[]}, action: DECK_ACTIONS) => {
    const { pile, amount } = action.payload;
    const { db, gameId } = action.payload.upload;
    console.log(state);
    switch(action.type) {
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
    CHANGE_TURN,
    DRAWN_ADD,
    PLAYED_ADD
}

type TURN_ACTIONS = {
    type: TURN_REDUCER_ACTION,
    payload: {
        player?: string,
        amount?: number,
        upload: {
            db: Database,
            gameId: string,
        }
    }
}

const turnReducer = (state: TurnSchema, action: TURN_ACTIONS) => {
    const { player, amount } = action.payload;
    const { db, gameId } = action.payload.upload; 

    switch(action.type) {
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
    HAND_CARDS__ADD
}

type PLAYER_ACTIONS = {
    type: PLAYER_REDUCER_ACTIONS,
    payload: {
        playerId: string,
        cards?: CardSchema[],
        upload: {
            db: Database,
            gameId: string,
        }
    }
}

const playerReducer = (state: PlayerSchema[], action: PLAYER_ACTIONS) => {
    const { playerId, cards } = action.payload;
    const { db, gameId } = action.payload.upload;
    const players = [...state];
    const player = getPlayer(state, playerId);
    switch(action.type) {
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
            return { ...prev, ...getPlayer(table.players, user?.uid ?? '').state }
        });
        /*eslint-disable-next-line*/
    }, [players]);

    useEffect(() => {
        if(!user) return navigate('/');
        opening();
        /*eslint-disable-next-line*/
    }, []);

    const opening = async () => {
        if(!user) return navigate('/');
        await connectGame(joinedGameID, db, setTable, user.uid, setLocalPlayer);
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

    const mapPlayerBars = () => {
        return table.players.map((player: PlayerSchema, ind: number) => {
            return (
                <UserAccountBox 
                    key={`player_bar__${ind}`}
                    isSideBox={true}
                    player={player}
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
            &&
            <HandOfCards 
                selectCard={selectCard}
                hand={localPlayer.hand}
            />
            }
            {user &&
            table.turn.player === user?.uid
            &&
            <div>
                <button
                onClick={() => {
                    const isEndOfRound = endTurn(db, table.players, table.turn, dispatchTurn, joinedGameID);
                    if(isEndOfRound) {
                        setTable((prev) => ({...prev, round: prev.round++}));
                        upload("ROUND", db, {roundState: table.round + 1}, joinedGameID);
                    }
                }}
                disabled={table.turn.drawn < table.rules.drawAmount}
                >
                    end turn
                </button>
            </div>
            }
            <p>{table.turn.player}</p>
        </div>
    )
}