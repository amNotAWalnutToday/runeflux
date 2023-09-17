import { useState, useEffect, useContext } from "react";
import CardSchema from "../schemas/cardSchema";
import UserContext from "../data/Context";

type Props = {
    cardState: { state: CardSchema, index: number },
    position: "HAND" | "SELECT" | "PENDING" | "TABLE" | "CREEPER" | "CATALOG",
    numberInLine?: number,
    inspectKeeper?: (card: { state: CardSchema, index: number } | null) => void,
    selectCard?: (card: { state: CardSchema, index: number } | null) => void,
    selectGoalGroup?: (goal: { state: CardSchema, index: number }) => void,
    selectedGoalGroup?: { state: CardSchema, index: number}[],
}

export default function Card({
    cardState, 
    position, 
    numberInLine,
    inspectKeeper,
    selectCard,
    selectedGoalGroup,
    selectGoalGroup,
}: Props) {
    const { user } = useContext(UserContext);

    const [isHover, setIsHover] = useState(false);
    const [animation, setAnimation] = useState(position === "HAND");

    useEffect(() => {
        setTimeout(() => {
            setAnimation(() => false);
        }, 300);
    }, []);

    const origin = `translate(calc(-50% * ${numberInLine}), -250px)`;
    const handPosition = `translate(calc(-50% * ${numberInLine}), ${isHover ? "-50px" : "0"})`
    
    const checkGoalIsSelected = () => {
        if(!selectedGoalGroup) return false;
        for(const goal of selectedGoalGroup) {
            if(goal.state.id === cardState.state.id) return true;
        }
        return false;
    }

    const getStyle = () => {
        if(!user?.cardCatalog) return;
        if(position === "HAND" || position === "SELECT" || position === "CATALOG") {
            const playedAmount = user?.cardCatalog[`${cardState.state.id}`];
            if(!playedAmount) return "";
            if(playedAmount > 999) return "gtrim twilight";
            else if(playedAmount > 499) return "gtrim";
            else if(playedAmount > 249) return "strim";
            else if(playedAmount > 49) return "btrim"
        }
    }

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

    return cardState.state ? (
        <div 
            className={`card ${getStyle()} ${cardState.state.type.toLowerCase()} ${position === "PENDING" ? "pending" : ""} ${position === "HAND" ? "hand_card": ""} ${checkGoalIsSelected() ? "goal_selected" : ""}`} 
            style={ position === "HAND" ? {transform: animation ?  origin : handPosition} 
                : position === "CREEPER" ? {transform: "scale(0.3) translate(-300px, -100px)"} : {} 
            } 
            onMouseEnter={((e) => {
                if(animation) return;
                e.stopPropagation();
                setIsHover(true);
            })}
            onMouseLeave={((e) => {
                e.stopPropagation();
                setIsHover(false);
            })}
            onClick={
                (!inspectKeeper 
                    ? () => selectCard && selectCard(cardState)
                    : () => inspectKeeper(cardState))
            }
            onContextMenu={(e) => {
                e.preventDefault();
                if(!selectGoalGroup || cardState.state.type !== "GOAL") return;
                selectGoalGroup(cardState);
            }}
        >
            <div className='card_container__inner_left'>
                <div className='card_header__background' >
                    <h4 className='card_header__text' >{cardState.state.name.split(" ").join("_")}</h4>
                </div>
            </div>
            <div className='card_container__inner_right'>
                <h2>{cardState.state.type}</h2>
                <h3>{cardState.state.name}</h3>
                <hr className='card_hr__thick' />
                <p>{cardState.state.type === "GOAL" ? mapGoalText() : cardState.state.text }</p>
            </div>
        </div>
    ) : null
}