import { useContext } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import CardSchema from "../schemas/cardSchema";
import PlayerSchema from "../schemas/playerSchema"
import Card from "../components/Card";
import HandOfCards from "../components/HandOfCards";
import roomFunctions from '../utils/roomFunctions';
import accountFunctions from '../utils/accountFunctions';
import UserContext from '../data/Context';
import UserAccountBox from '../components/UserAccountBox';

const { destroyRoom, leaveRoom } = roomFunctions;
const { uploadStats } = accountFunctions;

type Props = {
    winGameStats: {
        winner: PlayerSchema | null,
        goal: CardSchema | null,
        round: number,
    }
}

export default function Gameover({winGameStats}: Props) {
    const { winner, round, goal } = winGameStats;
    const { joinedGameID, setJoinedGameID, db, user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    useBeforeUnload(() => {
        updateUser();
        if(user?.uid === joinedGameID) {
            destroyRoom(db, joinedGameID, setJoinedGameID);
        }
    });

    const updateUser = () => {
        if(!user || !goal) return;
        if(winner?.user.uid === user.uid) {
            const playedAmount = user?.cardCatalog[`${goal?.id}`] + 1;
            const winAmount = user.stats.wins + 1;
            uploadStats("CARD", db, {cardKey: goal?.id, cardNum: playedAmount}, user.uid);
            uploadStats("WINS", db, {amount: winAmount}, user.uid);
            setUser((prev) => {
                if(!prev) return;
                return { 
                    ...prev, 
                    cardCatalog: Object.assign({}, prev.cardCatalog, {[`${goal.id}`]: playedAmount}), 
                    stats: Object.assign({}, prev.stats, {wins: winAmount}),
                };
            }); 
        }
        const roundAmount = user.stats.totalRounds + round;
        const gamesPlayedAmount = user.stats.played + 1;
        uploadStats("ROUNDS", db, {amount: roundAmount}, user.uid);
        uploadStats("PLAYED", db, {amount: gamesPlayedAmount}, user.uid);
        setUser((prev) => {
            if(!prev) return;
            return {
                ...prev,
                stats: Object.assign({}, prev.stats, {played: gamesPlayedAmount, totalRounds: roundAmount}),
            }
        });
    }

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
                                updateUser();
                                if(user?.uid === joinedGameID) {
                                    destroyRoom(db, joinedGameID, setJoinedGameID);
                                } else {
                                    leaveRoom(db, joinedGameID, user, setJoinedGameID);
                                }
                                navigate('/lobby');
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
