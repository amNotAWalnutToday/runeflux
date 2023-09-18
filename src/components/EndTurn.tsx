import { useState } from 'react';
import GameSchema from "../schemas/gameSchema";
import PlayerSchema from "../schemas/playerSchema";
import ErrorMessage from './ErrorMessage';

type Props = {
    table: GameSchema,
    localPlayer: PlayerSchema,
    endTurn: () => void,
}

export default function EndTurn({table, localPlayer, endTurn}: Props) {
    const [errors, setErrors] = useState<string[]>([]);
    
    const checkIfDisabled = () => {
        const hasDrawn        = table.turn.drawn           >= table.rules.drawAmount;
        const hasPlayed       = table.turn.played          >= table.rules.playAmount
                             || !localPlayer.hand.length;
        const isHandFull      = localPlayer.hand.length    >  table.rules.handLimit;
        const isKeepersFull   = localPlayer.keepers.length > table.rules.keeperLimit
                             && !checkIfKeepersAllCreepers();
        const isTurn          = table.turn.player === localPlayer.user.uid; 
        const isUsingWormhole = table.turn.temporary.hand.length > 0;

        if(!hasDrawn || !hasPlayed || isHandFull || isKeepersFull || !isTurn || isUsingWormhole) {
            return [hasDrawn, hasPlayed, isHandFull, isKeepersFull, isTurn, isUsingWormhole];
        }
        else return false;
    }

    const checkIfKeepersAllCreepers = () => {
        if(!localPlayer.keepers) return;
        let creepers = 0;
        for(const keeper of localPlayer.keepers) {
            if(keeper.type === "CREEPER") creepers++;
        }
        return creepers === localPlayer.keepers.length;
    }

    const displayErrors = (errors: boolean[]) => {
        const errorMessages: string[] = []
        if(!errors[0]) {
            errorMessages.push("Draw limit not reached!");
        } 
        if(!errors[1]) {
            errorMessages.push("Play limit not reached!");
        }
        if(errors[2]) {
            errorMessages.push("Hand limit reached! Discard down.");
        }
        if(errors[3]) {
            errorMessages.push("Keeper limit reached! Discard a keeper.");
        }
        if(!errors[4]) {
            errorMessages.push("Please wait your turn.");
        }
        if(errors[5]) {
            errorMessages.push("Finish using all the cards in hand.");
        }
        setErrors(() => ([...errorMessages]));
    }

    const clearErrors = () => {
        setErrors(() => []);
    }

    const mapErrors = () => {
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
        <div className='endturn_btn_container' >  
            <button
                style={{whiteSpace: "nowrap"}}
                className={`endturn_btn ${checkIfDisabled() || table.pending ? "disabled" : ""}`}
                onClick={() => {
                    if(table.pending) return;
                    const isError = checkIfDisabled();
                    if(isError) return displayErrors([...isError]);
                    else endTurn();
                }}
            >
                End Turn
            </button>  
            {
                errors.length 
                    ? mapErrors()
                    : null
            }
        </div>
    )
}
