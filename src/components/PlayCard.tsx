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
}

export default function PlayCard({
    cardState, 
    table, 
    localPlayer,  
    playCard, 
    discardCard
}: Props) {
    const [playErrors, setPlayErrors] = useState<string[]>([]);
    const [discardErrors, setDiscardErrors] = useState<string[]>([]);
    const { user } = useContext(UserContext);

    const checkIfPlayDisabled = () => {
        const hasPlayed = table.turn.played >= table.rules.playAmount;
        const isTurn    = table.turn.player === user?.uid;

        if(hasPlayed || !isTurn) {
            return [hasPlayed, isTurn];
        }
        else return false;
    }

    const displayPlayErrors = (errors: boolean[]) => {
        const errorMessages: string[] = [];
        console.log(playErrors);
        if(errors[0]) {
            errorMessages.push("Play limit reached! End turn.");
        }
        if(!errors[1]) {
            errorMessages.push("Please wait for your turn.");
        }
        setPlayErrors(() => [...errorMessages]);
    }

    const clearPlayErrors = () => setPlayErrors(() => []);

    const checkIfDiscardDisabled = () => {
        const isHandFull = localPlayer.hand.length > table.rules.handLimit;

        if(!isHandFull) {
            return [isHandFull];
        }
        else return false;
    }

    const displayDiscardErrors = (errors: boolean[]) => {
        const errorMessages: string[] = [];
        if(!errors[0]) {
            errorMessages.push("Hand limit has not been reached.")
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
                    className={`play_btn__card ${table.pending || checkIfPlayDisabled() ? "disabled" : ""}`}
                    onClick={() => {
                        if(table.pending) return;
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