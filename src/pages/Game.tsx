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

const enum REDUCER_ACTIONS {
    RULE_CHANGE__DRAW,
    RULE_CHANGE__PLAY,
    RULE_CHANGE__KEEPER_LIMIT,
    RULE_CHANGE__HAND_LIMIT,
    RULE_CHANGE__LOCATION,
    RULE_CHANGE__TELEBLOCK,
}

type TABLE_ACTIONS = {
    type: REDUCER_ACTIONS
    payload?: {
        amount: number
    },
}

const rulesReducer = (state, action: TABLE_ACTIONS) => {
    switch(action.type) {
        case REDUCER_ACTIONS.RULE_CHANGE__DRAW: 
            return Object.assign({}, state, {drawAmount: action.payload?.amount})
        default: 
            return state;
    }
}

export default function Game() {
    const { loadGame, getPlayer } = gameFunctions;

    const [selectedCard, setSelectedCard] = useState<CardSchema | null>(null);
    const { db, user } = useContext(UserContext);
    const [table, setTable] = useState<GameSchema>(loadGame(user));
    const [localPlayer, setLocalPlayer] = useState(getPlayer(table.players, user?.uid ?? '').state)
    const [rules, dispatchTable] = useReducer(rulesReducer, table.rules);

    useEffect(() => {
        console.log(rules);
        // gameFunctions.drawCards(table, user?.uid ?? '0005', 5);
        // setTimeout(() => dispatchTable({type: REDUCER_ACTIONS.RULE_CHANGE__DRAW, payload: { amount:Math.random() * 10}}), 3000)
    }, [rules]);

    const selectCard = (card: CardSchema | null) => {
        setSelectedCard((prev) => {
            if(prev === null || card === null) return card;
            else return prev.name === card.name ? null : card;
        });
    }

    return(
        <div className='game_container' >
            <UserAccountBox />
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
                    gameFunctions.drawCards(table, setTable, user?.uid ?? '', setLocalPlayer, 5)
                    console.log(table);
                }} >press me</button>
        </div>
    )
}