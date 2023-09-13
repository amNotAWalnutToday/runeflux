import { useState } from "react";
import CardSchema from "../schemas/cardSchema";
import Card from "./Card";
import ErrorMessage from "./ErrorMessage";
import GameSchema from "../schemas/gameSchema";
import PlayerSchema from "../schemas/playerSchema";

type Props = {
    cardState: { state: CardSchema, index: number },
    table: GameSchema,
    localPlayer: PlayerSchema,
    playEffect: (keeperId: string, keeperIndex: number) => void,
    discardKeeper: (cardIndex: number, addToDiscard?: boolean) => void,
    inspectKeeper: (card: {state: CardSchema, index: number} | null) => void,
}

export default function InspectKeeper({
    cardState, 
    table, 
    localPlayer, 
    playEffect,
    discardKeeper,
    inspectKeeper,
}: Props) {
    const [playErrors, setPlayErrors] = useState<string[]>([]);
    const [discardErrors, setDiscardErrors] = useState<string[]>([]);
    const clearPlayErrors = () => setPlayErrors(() => []);
    const clearDiscardErrors = () => setDiscardErrors(() => []);

    const checkIfPlayDisabled = () => {
        const isOnCooldown = cardState.state.cooldown ? true : false;
        const hasEffect = cardState.state.effects ? true : false;

        if(isOnCooldown || !hasEffect) {
            return [isOnCooldown, hasEffect];
        }

        return false;
    }

    const displayPlayErrors = (errors: boolean[]) => {
        const errorMessages: string[] = [];
        if(errors[0]) {
            errorMessages.push("On Cooldown.");
        }
        if(errors[1] === false) {
            errorMessages.push("This Keeper has no effects.")
        }
        setPlayErrors(() => [...errorMessages]);
    }

    const checkIfDiscardDisabled = () => {
        const isKeepersFull = localPlayer.keepers.length > table.rules.keeperLimit;
        const isTurn        = table.turn.player === localPlayer.user.uid;
        const isCreeper     = cardState.state.type === "CREEPER";
        const hasCreeperAttached = cardState.state.attachment ? true : false;
        const isYours       = (localPlayer.keepers.length > cardState.index 
                                ?  localPlayer.keepers[cardState.index].id === cardState.state.id
                                : false);


        if(!isKeepersFull || !isTurn || isCreeper || hasCreeperAttached || !isYours) {
            return [isKeepersFull, isTurn, isCreeper, hasCreeperAttached, isYours];
        }

        return false;
    }

    const displayDiscardErrors = (errors: boolean[]) => {
        const errorMessages: string[] = [];
        if(errors[0] === false) {
            errorMessages.push("Keeper limit not reached. no point in discarding.");
        }
        if(errors[1] === false) {
            errorMessages.push("Please wait your turn..");
        }
        if(errors[2]) {
            errorMessages.push("Cannot discard creeper in a conventional manner.");
        }
        if(errors[3]) {
            errorMessages.push("Cannot discard a keeper with a creeper attached.");
        }
        if(errors[4] === false) {
            errorMessages.push("That Keeper is not yours!");
        }
        setDiscardErrors(() => [...errorMessages]);
    }

    const mapErrors = (errors: string[], clearErrors: () => void) => {
        return errors.map((message, ind) => {
            return (
                <ErrorMessage
                    key={`inspect_keeper_error__${ind}`}
                    message={message}
                    clearErrors={clearErrors}
                />
            )
        });
    }

    return ( 
        <>
            <div className="underlay" onClick={() => {
                inspectKeeper(null);
            }} />
            <div className="popup" >
                <Card
                    cardState={cardState}
                    position={"SELECT"}
                />
                <div className="play_btn_group__card">
                    <div className="errors_container__play" >
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
                            playEffect(cardState.state.id, cardState.index);
                        }}
                    >
                        Use Effect
                    </button>
                    <div className="errors_container__discard" >
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
                            discardKeeper(cardState.index);
                        }}
                    >
                        Discard Card
                    </button>
                </div>
            </div>
        </>
    )
}