import { useState, useReducer } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import UserSchema from './schemas/userSchema';
import firebaseConfig from '../firebaseConfig';
import start_rules from './data/start_rules.json';
import INIT_RULES_REDUCER_ACTIONS from './schemas/reducers/INIT_RULE_REDUCER_ACTIONS';
import UserContext from './data/Context';
import roomFunctions from './utils/roomFunctions';
import MainMenu from './pages/MainMenu';
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Login from "./pages/Login";
import Gameover from "./pages/Gameover";
import Account from './pages/Account';
import CardCatalog from './pages/CardCatalog';
import PlayerSchema from './schemas/playerSchema';
import CardSchema from './schemas/cardSchema';
import PageNotFound from './pages/PageNotFound';

const app = initializeApp(firebaseConfig);
const { initRulesReducer } = roomFunctions;

export default function RouteSwitch() {
    const [user, setUser] = useState<UserSchema | undefined>();
    const [joinedGameID, setJoinedGameID] = useState("");

    const [initRules, dispatchInitRules] = useReducer(initRulesReducer, start_rules);
    const [winGameStats, setWinGameStats] = useState<{winner: null | PlayerSchema, round: number, goal: CardSchema | null}>({
        winner: null,
        round: 0,
        goal: null,
    });

    const db = getDatabase(app, "https://flux-bbbdc-default-rtdb.europe-west1.firebasedatabase.app/");
    const auth = getAuth();

    const setInitRules = (type: string) => {
        switch(type) {
            case "DRAW_INCREMENT":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.DRAW_INCREMENT, payload: {}});
            case "DRAW_DECREMENT":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.DRAW_DECREMENT, payload: {}});
            case "PLAY_INCREMENT":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.PLAY_INCREMENT, payload: {}});
            case "PLAY_DECREMENT":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.PLAY_DECREMENT, payload: {}});
            case "HAND_LIMIT_INCREMENT":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.HAND_LIMIT_INCREMENT, payload: {}});
            case "HAND_LIMIT_DECREMENT":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.HAND_LIMIT_DECREMENT, payload: {}});
            case "KEEPER_LIMIT_INCREMENT":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.KEEPER_LIMIT_INCREMENT, payload: {}});
            case "KEEPER_LIMIT_DECREMENT":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.KEEPER_LIMIT_DECREMENT, payload: {}});
            case "LOCATION_RIGHT":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.LOCATION_RIGHT, payload: {}});
            case "LOCATION_LEFT":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.LOCATION_LEFT, payload: {}});
            case "TELEBLOCK_ON":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.TELEBLOCK_ON, payload: {}});
            case "TELEBLOCK_OFF":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.TELEBLOCK_OFF, payload: {}});
            case "RESET":
                return dispatchInitRules({type: INIT_RULES_REDUCER_ACTIONS.RESET, payload: {}});
        }
    }

    return (
        <Router basename="runeflux" >
            <UserContext.Provider value={{user, setUser, db, auth, joinedGameID, setJoinedGameID}}>
                <Routes>
                    <Route
                        path='/'
                        element={
                            <MainMenu />
                        }
                    />
                    <Route
                        path='/lobby'
                        element={
                            <Lobby 
                                initRules={initRules}
                                setInitRules={setInitRules}
                            />
                        }
                    />
                    <Route
                        path='/game'
                        element={
                            <Game 
                                setWinGameStats={setWinGameStats}
                            />
                        }
                    />
                    <Route
                        path='/login'
                        element={
                            <Login />
                        }
                    />
                    <Route
                        path='/gameover'
                        element={
                            <Gameover 
                                winGameStats={winGameStats}
                            />
                        }
                    />
                    <Route
                        path='/account'
                        element={
                            <Account />
                        }
                    />
                    <Route
                        path='/catalog'
                        element={
                            <CardCatalog />
                        }
                    />
                    <Route
                        path={'*'}
                        element={
                            <PageNotFound />
                        }
                    />
                </Routes>
            </UserContext.Provider>
        </Router>
    )
}