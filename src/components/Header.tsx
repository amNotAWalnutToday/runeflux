import { useContext } from 'react';
import { useNavigate } from "react-router-dom"
import UserContext from '../data/Context';
// import accountFunctions from '../utils/accountFunctions';

// const { signout } = accountFunctions;


type Props = {
    pageType: "LOBBY" | "ACCOUNT" | "CATALOG" | "GAME",
    leaveGame?: () => void,
}

export default function Header({pageType, leaveGame}: Props) {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <div className="lobby_header" >
            <h1 className="header_title" >RuneFlux</h1>
            <div>
                <button
                    className={`header_btn ${pageType === "ACCOUNT" ? "selected" : ""}`}
                    onClick={() => {
                        navigate('/account');
                    }}
                >
                    Account
                </button>
                <button
                    className={`header_btn ${pageType === "CATALOG" ? "selected" : ""}`}
                    onClick={() => {
                        navigate('/catalog');
                    }}
                >
                    Card Catalog
                </button>
                <button
                    className={`header_btn ${pageType === "LOBBY" ? "selected" : ""}`}
                    onClick={() => {
                        navigate('/lobby');
                    }}
                >
                    Lobby
                </button>
                <button
                    className="header_btn"
                    onClick={async () => {
                        // await signout(auth);
                        setUser(() => undefined);
                        navigate('/');
                    }}
                >
                    Log Out
                </button>
                {
                    pageType === "GAME"
                    &&
                    <button
                        className="header_btn"
                        onClick={leaveGame}
                    >
                        Leave Game
                    </button>
                }
            </div>
        </div>
    )
}
