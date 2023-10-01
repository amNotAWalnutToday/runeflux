import { useState, useEffect, useContext } from "react";
import CardSchema from "../schemas/cardSchema";
import PlayerSchema from "../schemas/playerSchema";
import UserContext from "../data/Context";

type Props = {
    cardState: { state: CardSchema, index: number },
    position: "HAND" | "SELECT" | "PENDING" | "TABLE" | "CREEPER" | "CATALOG" | "PREVIOUS_PENDING",
    numberInLine?: number,
    player?: PlayerSchema,
    inspectKeeper?: (card: { state: CardSchema, index: number, playerIndex: number } | null) => void,
    selectCard?: (card: { state: CardSchema, index: number } | null) => void,
    selectGoalGroup?: (goal: { state: CardSchema, index: number }) => void,
    selectedGoalGroup?: { state: CardSchema, index: number}[],
}

export default function Card({
    cardState, 
    position, 
    numberInLine,
    player,
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
        if(!user?.cardCatalog || (player && !player.user.cardCatalog)) return;
        if(position === "HAND" || position === "SELECT" || position === "CATALOG"
        || position === "PENDING" || position === "PREVIOUS_PENDING") {
            const playedAmount = (
                player  
                    ? player.user.cardCatalog[`${cardState.state.id}`]
                    : user?.cardCatalog[`${cardState.state.id}`]
            );
            if(!playedAmount) return "";
            if(playedAmount > 999) return "gtrim twilight";
            else if(playedAmount > 499) return "gtrim";
            else if(playedAmount > 249) return "strim";
            else if(playedAmount > 49) return "btrim"
        }
    }

    const convertNameToImage = (name: string) => {
        return name.split("'").join("").split(" ").join("_").toLowerCase();
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

    const mapGoalImage = () => {
        return cardState.state.text.split("|").map((segment, ind) => {
            if(ind % 2 !== 1) return;
            return (
                <div
                    key={`goal_image__${segment}_${ind}`} 
                    className={`${convertNameToImage(segment)} goal_image`}
                />
            )
        });
    }

    const mapCounterText = () => {
        return cardState.state.text.split("|").map((paragraph, ind) => {
            return (
                <span
                    key={`counter_text__${ind}`}
                    className="counter_p"
                >
                    {paragraph}
                </span>
            )
        });
    }

    return cardState.state ? (
        <div 
            className={`card ${getStyle()} ${cardState.state.type.toLowerCase()} ${position === "PREVIOUS_PENDING" ? "previous_pending" : ""} ${position === "PENDING" ? "pending" : ""} ${position === "HAND" ? "hand_card": ""} ${checkGoalIsSelected() ? "goal_selected" : ""}`} 
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
                    : () => inspectKeeper({...cardState, playerIndex: 0}))
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
                <h2>
                    {cardState.state.type}
                    <span className={`${cardState.state.subtype.toLowerCase()}_subtype icon card_subtype`} ></span>
                </h2>
                <h3 className="card_title" >{cardState.state.name}</h3>
                <hr className='card_hr__thick' />
                <p>{cardState.state.type === "GOAL" 
                        ? !user?.goalImages 
                            ? mapGoalText()
                            : '' 
                        : cardState.state.type === "COUNTER" 
                            ? mapCounterText() 
                            : cardState.state.text
                            }
                </p>
                {cardState.state.type !== "GOAL"
                &&
                <div
                    className={`${convertNameToImage(cardState.state.name)} card_image`}
                />
                }
                {user?.goalImages && cardState.state.type === "GOAL"
                &&
                    <div className="goal_images" >{ mapGoalImage() }</div>
                }
            </div>
        </div>
    ) : null
}