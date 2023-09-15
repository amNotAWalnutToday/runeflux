import { useContext } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import CardSchema from "../schemas/cardSchema";
import PlayerSchema from "../schemas/playerSchema"
import Card from "../components/Card";
import HandOfCards from "../components/HandOfCards";
import roomFunctions from '../utils/roomFunctions';
import UserContext from '../data/Context';
import UserAccountBox from '../components/UserAccountBox';

const { destroyRoom, leaveRoom } = roomFunctions;

type Props = {
    winGameStats: {
        winner: PlayerSchema | null,
        goal: CardSchema | null,
        round: number,
    }
}

export default function Gameover({winGameStats}: Props) {
    const { winner, round, goal } = winGameStats;
    const { joinedGameID, setJoinedGameID, db, user } = useContext(UserContext);
    const navigate = useNavigate();

    useBeforeUnload(() => {
        if(user?.uid === joinedGameID) {
            destroyRoom(db, joinedGameID, setJoinedGameID);
        }
    });

    return (
        <>  
            <UserAccountBox/>
            <div className="popup" >
                <div className="duel_group" >
                    <Card
                        cardState={{ state: goal ?? {} as CardSchema, index: 0}}
                        position={"SELECT"}
                    />
                    <div className="duel_group__middle flex_j">
                        <div>
                            <h1>{winner?.user.username} Wins!</h1>
                            <h2>in {round} rounds</h2>
                        </div>
                        <button 
                            className="play_btn__card flipped" 
                            onClick={() => {
                                if(!user) return;
                                if(user?.uid === joinedGameID) {
                                    destroyRoom(db, joinedGameID, setJoinedGameID);
                                } else {
                                    leaveRoom(db, joinedGameID, user, setJoinedGameID);
                                }
                                navigate('/');
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
            <HandOfCards
                hand={winner?.keepers ?? []}
                selectCard={() => null}
            />
        </>
    )
}
