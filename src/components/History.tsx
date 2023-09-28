import { useEffect, useRef } from 'react';
import gameFunctions from '../utils/gameFunctions';
import MiniCard from "./MiniCard";

const { getCardById } = gameFunctions;

type Props = {
    history: {
        played: {id: string, target: string, player: string}[],
        discarded: string[]
    }
}

export default function History({history}: Props) {
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
                    <h3>{item.player}</h3>
                    <MiniCard
                        isSideWays={false}
                        cardState={{state: getCardById(item.id), index }}
                    />
                    {
                    item.target
                    &&
                    <MiniCard
                        isSideWays={false}
                        playerNum={1}
                        targets={[{id: item.target, index: 0, playerIndex: 0}]}
                        cardState={{state: getCardById(item.target), index: 0}}
                    />
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
