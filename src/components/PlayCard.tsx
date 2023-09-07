import { useState, useContext } from 'react';
import UserContext from '../data/Context';
import CardSchema from "../schemas/cardSchema"
import GameSchema from "../schemas/gameSchema"
import Card from "./Card"
import ErrorMessage from './ErrorMessage';

type Props = {
    cardState: { state: CardSchema, index: number },
    table: GameSchema,
    playCard: (card: CardSchema | false, indexInHand: number) => void,
    discardCard: (cardIndex: number) => void,
}

export default function PlayCard({cardState, table, playCard, discardCard}: Props) {
    const [playErrors, setPlayErrors] = useState<string[]>([]);
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

    const clearPlayErrors = () => {
        setPlayErrors(() => []);
    }

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
                <button
                    className="discard_btn__card"
                    onClick={() => discardCard(cardState.index)}
                >
                    Discard Card
                </button>
            </div>
        </div>
    )
}