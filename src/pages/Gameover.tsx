import { useNavigate } from 'react-router-dom';
import CardSchema from "../schemas/cardSchema";
import PlayerSchema from "../schemas/playerSchema"
import Card from "../components/Card";
import HandOfCards from "../components/HandOfCards";

type Props = {
    winGameStats: {
        winner: PlayerSchema | null,
        goal: CardSchema | null,
        round: number,
    }
}

export default function Gameover({winGameStats}: Props) {
    const { winner, round, goal } = winGameStats;
    const navigate = useNavigate();

    return (
        <>
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
