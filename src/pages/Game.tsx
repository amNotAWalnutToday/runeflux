import { useEffect, useState, useReducer, useContext } from 'react';
// import { ref, set } from 'firebase/database';
import UserAccountBox from '../components/UserAccountBox';
import HandOfCards from '../components/HandOfCards';
import PlayCard from '../components/PlayCard';
import UserContext from '../data/Context';
import GameSchema from '../schemas/gameSchema';
import CardSchema from '../schemas/cardSchema';
import gameFunctions from '../utils/gameFunctions';
import PlayerSchema from '../schemas/playerSchema';
import { useNavigate } from 'react-router-dom';

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

export default function Game() {
    const { loadGame, getPlayer, connectGame } = gameFunctions;
    const navigate = useNavigate();

    const [selectedCard, setSelectedCard] = useState<CardSchema | null>(null);
    const { db, user, joinedGameID } = useContext(UserContext);
    const [table, setTable] = useState<GameSchema>(loadGame(user));
    const [localPlayer, setLocalPlayer] = useState(getPlayer(table.players, user?.uid ?? '').state)
    const [rules, dispatchRules] = useReducer(rulesReducer, table.rules);
    const [deck, dispatchDeck] = useReducer(deckReducer, table.deck);

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
        if(!user) return navigate('/');
        connectGame(joinedGameID, db, setTable);
    }, []);

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
            <HandOfCards 
                selectCard={selectCard}
                hand={localPlayer.hand}
            />
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
        </div>
    )
}