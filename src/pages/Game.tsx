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
    const { loadGame, getPlayer, connectGame } = gameFunctions;

    const [selectedCard, setSelectedCard] = useState<CardSchema | null>(null);
    const { db, user, joinedGameID } = useContext(UserContext);
    const [table, setTable] = useState<GameSchema>(loadGame(user));
    const [localPlayer, setLocalPlayer] = useState(getPlayer(table.players, user?.uid ?? '').state)
    const [rules, dispatchTable] = useReducer(rulesReducer, table.rules);
    
    useEffect(() => {
        console.log(rules);
        // gameFunctions.drawCards(table, user?.uid ?? '0005', 5);
        // setTimeout(() => dispatchTable({type: REDUCER_ACTIONS.RULE_CHANGE__DRAW, payload: { amount:Math.random() * 10}}), 3000)
    }, [rules]);

    useEffect(() => {
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
        </div>
    )
}