import { useState, useEffect, useContext } from 'react';
import PlayerSchema from "../schemas/playerSchema"
import TurnSchema from "../schemas/turnSchema"
import gameFunctions from '../utils/gameFunctions';
import UserContext from '../data/Context';

const { getPlayer } = gameFunctions;

type Props = {
    turn: TurnSchema,
    players: PlayerSchema[],
    rollForDuel: () => void,
    endDuel: (winnerId: string) => void,
}

export default function Duel({turn, players, rollForDuel, endDuel}: Props) {
    const { user } = useContext(UserContext);

    const [player1, setPlayer1] = useState(getPlayer(players, turn.duel.player1.id));
    const [player2, setPlayer2] = useState(getPlayer(players, turn.duel.player2.id));

    const canRoll = () => {
        if(user?.uid === turn.duel.player1.id
        && turn.duel.player1.num === 0) return 1;
        else if(user?.uid === turn.duel.player2.id
             && turn.duel.player2.num === 0) return 2;
        else return 0;
    }

    useEffect(() => {
        if(!turn.duel.player1.id || !turn.duel.player2.id) return;
        setPlayer1(() => {
            return getPlayer(players, turn.duel.player1.id);
        });
        setPlayer2(() => {
            return getPlayer(players, turn.duel.player2.id);
        });

    }, [turn]);

    const checkWinner = () => {
        if(turn.duel.player1.num > turn.duel.player2.num
        && (turn.duel.player1.num !== 0 && turn.duel.player2.num !== 0)) return 1;
        else if(turn.duel.player2.num >= turn.duel.player1.num
            && (turn.duel.player2.num !== 0 && turn.duel.player1.num !== 0)) return 2;
        else return 0;
    }


    return (
        <div className="popup" >
            <div className='duel_group' >
                <div className='duel_group__left' >
                    <h2>{player1.state.user.username}</h2>
                    <h2>{turn.duel.player1.num}</h2>
                    <button className={`play_btn__card ${canRoll() !== 1 ? "disabled" : ""}`}
                        onClick={() => {
                            if(canRoll() !== 1) return;
                            rollForDuel();
                        }}
                    >
                        Roll Dice
                    </button>
                </div>
                <div className='duel_group__middle'>
                    <h1>
                        {checkWinner() === 0
                            ? "V/S"
                            : checkWinner() === 1
                                ? `${player1.state.user.username}`
                                : `${player2.state.user.username} Wins!`
                        }
                    </h1>
                    {
                    checkWinner() > 0
                    &&
                    <div className='duel_group__left' >
                        <hr className='card_hr__thick full_width' />
                        <button 
                            className='challenge_btn__card' 
                            onClick={() => {
                                const winnerId = (checkWinner() === 1 
                                    ? turn.duel.player1.id 
                                    : turn.duel.player2.id)
                                endDuel(winnerId);
                            }}
                        >
                            Continue
                        </button>
                    </div>
                    }
                </div>
                <div className='duel_group__right' >
                    <h2>{player2.state.user.username}</h2>
                    <h2>{turn.duel.player2.num}</h2>
                    <button 
                        className={`play_btn__card flipped ${canRoll() !== 2 ? "disabled" : ""}`} 
                        onClick={() => {
                            if(canRoll() !== 2) return;
                            rollForDuel();
                        }}
                    >
                        Roll Dice
                    </button>
                </div>
            </div>
        </div>
    )
}
