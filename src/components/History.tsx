import { useEffect, useRef } from 'react';
import gameFunctions from '../utils/gameFunctions';
import MiniCard from "./MiniCard";
import PlayerSchema from '../schemas/playerSchema';

const { getCardById } = gameFunctions;

type Props = {
    history: {
        played: {id: string, target: string[], player: string}[],
        discarded: string[]
    },
    players: PlayerSchema[],
}

export default function History({history, players}: Props) {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(!container || !container.current) return;
        container.current.scrollTo(
            0,
            container.current.offsetHeight + (history.played.length * 100)
        );
    });

    const mapPlayed = () => {
        if(!history) return;
        return history.played.map((item, index) => {
            return (
                <div
                    key={`play_history__${index}`}
                    className='history_play'
                >
                    <div
                        className='history_inner_left'
                    >
                        <h3>{item.player}</h3>
                        <MiniCard
                            isSideWays={false}
                            cardState={{state: getCardById(item.id), index }}
                        />
                    </div>
                    {
                    item.target && item.target.length
                    ?
                    <div className='history_targets' >
                        {item.target.map((targetCard, ind) => {
                            return (
                                <MiniCard
                                    key={`play_history__target_${ind}`}
                                    isSideWays={false}
                                    playerNum={1}
                                    targets={[{id: targetCard, index: 0, playerIndex: 0}]}
                                    cardState={{state: getCardById(targetCard, players), index: 0}}
                                />
                            );
                        })}
                    </div>
                    :
                    <div
                        style={{width: '150px', height: "75px"}}
                    >

                    </div>
                    }
                </div>
            )
        });
    }
    
    return (
        <div className="popup">
            <h2>Play History</h2>   
            <div ref={container} className='card_picker history'>
                {mapPlayed()}
            </div>
        </div>
    )
}
