import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
import firebaseConfig from '../firebaseConfig';
import UserContext from './data/Context';
import MainMenu from './pages/MainMenu';
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Login from "./pages/Login";

const app = initializeApp(firebaseConfig);

export default function RouteSwitch() {
    const [user, setUser] = useState<unknown>();

    const db = getDatabase(app, "https://flux-bbbdc-default-rtdb.europe-west1.firebasedatabase.app/");

    return (
        <Router basename="/runeflux" >
            <UserContext.Provider value={{user, setUser, db}}>
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
                            <Lobby />
                        }
                    />
                    <Route
                        path='/game'
                        element={
                            <Game />
                        }
                    />
                    <Route
                        path='/login'
                        element={
                            <Login />
                        }
                    />
                </Routes>
            </UserContext.Provider>
        </Router>
    )
}