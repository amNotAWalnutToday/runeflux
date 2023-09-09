import { useState, useEffect } from "react";
import CardSchema from "../schemas/cardSchema";

type Props = {
    cardState: { state: CardSchema, index: number },
    position: "HAND" | "SELECT" | "PENDING" | "TABLE",
    numberInLine?: number,
    selectCard?: (card: { state: CardSchema, index: number } | null) => void,
}

export default function Card({cardState, position, numberInLine, selectCard}: Props) {
    const [isHover, setIsHover] = useState(false);
    const [animation, setAnimation] = useState(position === "HAND");

    useEffect(() => {
        setTimeout(() => {
            setAnimation(() => false);
        }, 300);
    }, []);

    const origin = `translate(calc(-50% * ${numberInLine}), -250px)`;
    const handPosition = `translate(calc(-50% * ${numberInLine}), ${isHover ? "-50px" : "0"})`
    
    const mapGoalText = () => {
        return cardState.state.text.split("|").map((segment, ind) => {
            return (
                <span
                    key={`card_text__${ind}`}
                    style={{color: ind % 2 === 1 ? 'pink' : 'white'}}
                >
                    {segment}
                </span>
            )
        });
    }

    return(
        <div 
            className={`card ${cardState.state.type.toLowerCase()} ${position === "PENDING" ? "pending" : ""} ${position === "HAND" ? "hand_card": ""}`} 
            style={ position === "HAND" ? {transform: animation ?  origin : handPosition} : {} } 
            onMouseEnter={((e) => {
                if(animation) return;
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
                <p>{cardState.state.type === "GOAL" ? mapGoalText() : cardState.state.text }</p>
            </div>
        </div>
    )
}