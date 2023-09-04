import { useEffect, useState, useReducer, useContext } from 'react';
// import { ref, set } from 'firebase/database';
import UserAccountBox from '../components/UserAccountBox';
import HandOfCards from '../components/HandOfCards';
import PlayCard from '../components/PlayCard';
import UserContext from '../data/Context';
import GameSchema from '../schemas/gameSchema';
import CardSchema from '../schemas/cardSchema';
import gameFunctions from '../utils/gameFunctions';
import roomFunctions from '../utils/roomFunctions';
import PlayerSchema from '../schemas/playerSchema';
import { useNavigate } from 'react-router-dom';

const { 
    loadGame, 
    getPlayer, 
    connectGame, 
    chooseWhoGoesFirst,
    uploadTable,
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

const rulesReducer = (state, action: RULE_ACTIONS) => {
    switch(action.type) {
        case RULE_REDUCER_ACTIONS.RULE_CHANGE__DRAW: 
            return Object.assign({}, state, {drawAmount: action.payload?.amount})
        default: 
            return state;
    }
}

const enum DECK_REDUCER_ACTIONS {
    DECK_REPLACE__PURE
}

type DECK_ACTIONS = {
    type: DECK_REDUCER_ACTIONS,
    payload: {
        pile: CardSchema[]
    }
}

const deckReducer = (state, action: DECK_ACTIONS) => {
    switch(action.type) {
        case DECK_REDUCER_ACTIONS.DECK_REPLACE__PURE:
            return Object.assign({}, state, {pure: action.payload.pile})
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
        amount?: number
    }
}

const turnReducer = (state, action: TURN_ACTIONS) => {
    switch(action.type) {
        case TURN_REDUCER_ACTION.CHANGE_TURN:
            return Object.assign({}, state, {player: action.payload.player})
        default:
            return state;
    }
}

export default function Game() {
    const { startGame, checkGameInProgress } = roomFunctions;

    const navigate = useNavigate();

    const { db, user, joinedGameID } = useContext(UserContext);
    
    /*GLOBAL STATE*/
    const [table, setTable] = useState<GameSchema>(loadGame(user));
    const [rules, dispatchRules] = useReducer(rulesReducer, table.rules);
    const [deck, dispatchDeck] = useReducer(deckReducer, table.deck);
    const [turn, dispatchTurn] = useReducer(turnReducer, table.turn);

    /*LOCAL STATE*/
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<CardSchema | null>(null);
    const [localPlayer, setLocalPlayer] = useState(getPlayer(table.players, user?.uid ?? '').state)

    useEffect(() => {
        console.log(rules);
        // gameFunctions.drawCards(table, user?.uid ?? '0005', 5);
        // setTimeout(() => dispatchTable({type: REDUCER_ACTIONS.RULE_CHANGE__DRAW, payload: { amount:Math.random() * 10}}), 3000)
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
        if(!user) return navigate('/');
        opening();
        /*eslint-disable-next-line*/
    }, []);

    const opening = async () => {
        if(!user) return navigate('/');
        await connectGame(joinedGameID, db, setTable, user.uid, setLocalPlayer);
        console.log(user.uid, joinedGameID);
        if(user.uid === joinedGameID) {
            if(await checkGameInProgress(db, joinedGameID)) return;
            const firstTurn = chooseWhoGoesFirst(table.players);
            const updatedDeck = shuffleDeck(table.deck.pure);
            dispatchDeck({type: DECK_REDUCER_ACTIONS.DECK_REPLACE__PURE, payload: {pile: updatedDeck}});
            dispatchTurn({type: TURN_REDUCER_ACTION.CHANGE_TURN, payload: {player: firstTurn}});
            await upload("DECK_PURE", db, table, joinedGameID);
            await upload("TURN", db, table, joinedGameID);
            await startGame(db, joinedGameID);
        }
    }

    const selectCard = (card: CardSchema | null) => {
        setSelectedCard((prev) => {
            if(prev === null || card === null) return card;
            else return prev.name === card.name ? null : card;
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
            {
            selectedCard 
            &&
            <PlayCard  />
            }
            {
            localPlayer.hand.length
            &&
            <HandOfCards 
                selectCard={selectCard}
                hand={localPlayer.hand}
            />
            }
            <button onClick={() => { 
                    gameFunctions.drawCards(table, setTable, user?.uid ?? '', setLocalPlayer, db, joinedGameID);
                    console.log(table);
                }} >press me</button>
            <button
                onClick={() => {
                    const newDeck = gameFunctions.shuffleDeck(table.deck.pure);
                    dispatchDeck({type: DECK_REDUCER_ACTIONS.DECK_REPLACE__PURE, payload: {pile: newDeck}});
                    console.log(deck, table.deck.pure);
                }}
            >
                shuffle
            </button>

            {user &&
            table.turn.player === user?.uid
            &&
            <button
                onClick={() => drawPhase(table, setTable, user?.uid ?? '', setLocalPlayer, db, joinedGameID)}
            >
                Start Turn
            </button>
            }
            <p>{table.turn.player}</p>
        </div>
    )
}