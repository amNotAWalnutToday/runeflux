import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainMenu from './pages/MainMenu';
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Login from "./pages/Login";

export default function RouteSwitch() {
    return (
        <Router basename="/runeflux" >
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
        </Router>
    )
}