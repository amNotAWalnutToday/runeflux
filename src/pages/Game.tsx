import { useEffect, useReducer } from 'react';
import GameSchema from '../schemas/gameSchema';
import CardSchema from '../schemas/cardSchema';
import PlayerSchema from '../schemas/playerSchema';
import startDeckData from '../data/start_deck.json';
import startRuleData from '../data/start_rules.json';

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
    payload?: number,
}

const tableReducer = (state: GameSchema | unknown, action: TABLE_ACTIONS) => {
    switch(action.type) {
        case REDUCER_ACTIONS.RULE_CHANGE__DRAW: 
            return Object.assign({}, state, {rules: {drawAmount: action.payload, playAmount: 1, keeperLimit: 2, handLimit: 5, location: 'MISTHALIN', teleblock: false}})
        default: 
            return state;
    }
}

const loadGame = () => {
    const game = {
        deck: {
            pure: [] as unknown[],
            discard: [] as unknown[],
        },
        players: [] as PlayerSchema[],
        goal: [] as CardSchema[],
        round: 0,
    }
    for(const card of startDeckData.startDeck) {
        game.deck.pure.push(card);
    }
    return Object.assign({}, game, {rules: startRuleData});
}

export default function Game() {
    const [table, dispatchTable] = useReducer(tableReducer, loadGame());
    
    useEffect(() => {
        console.log(table);
        // setTimeout(() => dispatchTable({type: REDUCER_ACTIONS.RULE_CHANGE__DRAW, payload: Math.random() * 10}), 3000)
    }, [table])


    return(
        <div>
            
        </div>
    )
}