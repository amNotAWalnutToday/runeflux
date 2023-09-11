import { useState, useContext } from 'react';
import UserContext from '../data/Context';
import CardSchema from "../schemas/cardSchema"
import GameSchema from "../schemas/gameSchema"
import Card from "./Card"
import ErrorMessage from './ErrorMessage';
import PlayerSchema from '../schemas/playerSchema';

type Props = {
    cardState: { state: CardSchema, index: number },
    table: GameSchema,
    localPlayer: PlayerSchema,
    playCard: (card: CardSchema | false, indexInHand: number) => void,
    discardCard: (cardIndex: number) => void,
    fromWormhole?: boolean,
}

export default function PlayCard({
    cardState, 
    table, 
    localPlayer,  
    playCard, 
    discardCard,
    fromWormhole,
}: Props) {
    const [playErrors, setPlayErrors] = useState<string[]>([]);
    const [discardErrors, setDiscardErrors] = useState<string[]>([]);
    const { user } = useContext(UserContext);

    const checkIfPlayDisabled = () => {
        if(cardState.state.type === "COUNTER" && table.turn.player !== user?.uid) return checkIfCounterPlayDisabled();
        const { player, played, temporary } = table.turn;
        if(!fromWormhole) {
            const hasPlayed = table.turn.played >= table.rules.playAmount;
            const isTurn    = table.turn.player === user?.uid;

            if(hasPlayed || !isTurn) {
                return [hasPlayed, isTurn];
            }
        } else {
            if(!temporary) return false;
            const hasPlayed = temporary?.play < 1;

            if(hasPlayed) {
                return [hasPlayed];
            }
        } 

        return false;
    }

    const checkIfCounterPlayDisabled = () => {
        const { type, subtype } = table.pending && table.pending !== true ? table.pending : {type: "", subtype: ""};
        const isCardNotInPlay = table.pending ? false : true;
        const canCounter = [];
        if(cardState.state.id === "CO01" && subtype === "LOCATION") canCounter.push(false);
        if(cardState.state.id === "CO02" && type === "GOAL") canCounter.push(false);
        if(cardState.state.id === "CO03" && type === "ACTION") canCounter.push(false);
        if(cardState.state.id === "CO04" && type === "ACTION") canCounter.push(false);
        if(cardState.state.id === "CO05" && subtype === "BASIC") canCounter.push(false);
        if(cardState.state.id === "CO06" && type === "ACTION") canCounter.push(false);
    
        if(isCardNotInPlay || !canCounter.length) {
            return [isCardNotInPlay, !canCounter.length ? false : true];
        }
        return false;
    }

    const displayPlayErrors = (errors: boolean[]) => {
        const errorMessages: string[] = [];
        if(errors[0]) {
            if(!fromWormhole && user?.uid === table.turn.player) errorMessages.push("Play limit reached! End turn.")
            if(fromWormhole) errorMessages.push(`Play limit reached! Discard down to 0.`)
            if(user?.uid !== table.turn.player/*))*/
            && cardState.state.type === "COUNTER") errorMessages.push("No card to counter.");
        }
        if(errors[1] === false) {
            cardState.state.type === "COUNTER"
                ? errorMessages.push("Doesn't counter that type of card.")
                : errorMessages.push("Please wait for your turn.");
        }
        setPlayErrors(() => [...errorMessages]);
    }

    const clearPlayErrors = () => setPlayErrors(() => []);

    const checkIfDiscardDisabled = () => {
        if(!fromWormhole) {
            const isHandFull = localPlayer.hand.length > table.rules.handLimit;

            if(!isHandFull) {
                return [isHandFull];
            }
        } else {
            const hasPlayed = table.turn.temporary.play < 1;

            if(!hasPlayed) {
                return [hasPlayed];
            }
        }

        return false;
    }

    const displayDiscardErrors = (errors: boolean[]) => {
        const errorMessages: string[] = [];
        if(!errors[0]) {
            !fromWormhole
                ? errorMessages.push("Hand limit has not been reached.")
                : errorMessages.push(`Play ${table.turn.temporary.play} more.`)
        }
        setDiscardErrors(() => [...errorMessages]);
    }

    const clearDiscardErrors = () => setDiscardErrors(() => []);

    const mapErrors = (errors: string[], clearErrors: () => void) => {
        return errors.map((message, ind) => {
            return (
                <ErrorMessage
                    key={`endturn_error__${ind}`}
                    message={message}
                    clearErrors={clearErrors}
                />
            )
        });
    }
    
    return (
        <div className="popup" >
            <Card 
                cardState={cardState}
                position={"SELECT"}
            />
            <div className="play_btn_group__card" >
                <div className='errors_container__play' >
                    {
                        playErrors.length
                            ? mapErrors(playErrors, clearPlayErrors)
                            : null
                    }
                </div>
                <button 
                    className={`play_btn__card ${(table.pending && cardState.state.type !== "COUNTER") || checkIfPlayDisabled() ? "disabled" : ""}`}
                    onClick={() => {
                        if(table.pending && cardState.state.type !== "COUNTER") return;
                        const isError = checkIfPlayDisabled();
                        if(isError) return displayPlayErrors(isError);
                        playCard(cardState.state, cardState.index);
                    }}
                >
                    Play Card
                </button>
                <div className='errors_container__discard' >
                    {
                        discardErrors.length
                            ? mapErrors(discardErrors, clearDiscardErrors)
                            : null
                    }
                </div>
                <button
                    className={`discard_btn__card ${table.pending || checkIfDiscardDisabled() ? "disabled" : ""}`}
                    onClick={() => {
                        if(table.pending) return;
                        const isError = checkIfDiscardDisabled();
                        if(isError) return displayDiscardErrors(isError);
                        discardCard(cardState.index);
                    }}
                >
                    Discard Card
                </button>
            </div>
        </div>
    )
}