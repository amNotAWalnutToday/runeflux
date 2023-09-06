import { useState } from "react";
import CardSchema from "../schemas/cardSchema";

type Props = {
    cardState: { state: CardSchema, index: number },
    position: "HAND" | "SELECT",
    numberInLine?: number,
    selectCard?: (card: { state: CardSchema, index: number } | null) => void,
}

export default function Card({cardState, position, numberInLine, selectCard}: Props) {
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
            onClick={() => selectCard && selectCard(cardState)}
        >
            <div className='card_container__inner_left'>
                <div className='card_header__background' >
                    <h4 className='card_header__text' >{cardState.state.name.split(" ").join("_")}</h4>
                </div>
            </div>
            <div className='card_container__inner_right'>
                <h2>{cardState.state.type}</h2>
                <p>Attaches to Living</p>
                <h3>{cardState.state.name}</h3>
                <hr className='card_hr__thick' />
                <p>{cardState.state.text.specialEffects}</p>
                <div className='fake_img'></div>
            </div>
        </div>
    )
}