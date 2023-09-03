import { useState } from "react";
import CardSchema from "../schemas/cardSchema";

type Props = {
    position: "HAND",
    numberInLine?: number,
    selectCard: (card: CardSchema | null) => void,
}

export default function Card({position, numberInLine, selectCard}: Props) {
    const [isHover, setIsHover] = useState(false);
    
    return(
        <div 
            className={`card`} 
            style={ position === "HAND" ? {transform: `translate(calc(-50% * ${numberInLine}), ${isHover ? "-50px" : "0"})`} : {} } 
            onMouseEnter={((e) => {
                e.stopPropagation();
                setIsHover(true);
            })}
            onMouseLeave={((e) => {
                e.stopPropagation();
                setIsHover(false);
            })}
            onClick={() => selectCard({name: '1'})}
        >
            <div className='card_container__inner_left'>
                <div className='card_header__background' >
                    <h4 className='card_header__text' >The_Spread</h4>
                </div>
            </div>
            <div className='card_container__inner_right'>
                <h2>Creeper</h2>
                <p>Attaches to Living</p>
                <h3>The Spread</h3>
                <hr className='card_hr__thick' />
                <p>this is some flavour text that im not using lorem for so maybe use lorem next time?</p>
                <div className='fake_img'></div>
            </div>
        </div>
    )
}