import { useState, useContext } from "react";
import CardSchema from "../schemas/cardSchema";
import Card from "./Card";
import ErrorMessage from "./ErrorMessage";
import GameSchema from "../schemas/gameSchema";
import PlayerSchema from "../schemas/playerSchema";
import gameFunctions from "../utils/gameFunctions";
import UserContext from "../data/Context";

const { getPlayer } = gameFunctions;

type Props = {
    cardState: { state: CardSchema, index: number, playerIndex: number },
    table: GameSchema,
    localPlayer: PlayerSchema,
    playEffect: (keeperId: string, keeperIndex: number) => void,
    startDuel: (victimId: string, card: {state: CardSchema, index: number, playerIndex: number}) => void,
    discardKeeper: (cardIndex: number, addToDiscard?: boolean) => void,
    inspectKeeper: (card: {state: CardSchema, index: number, playerIndex: number} | null) => void,
    selectedKeeperGroup: { state: CardSchema, index: number, playerIndex: number }[],
    selectedPlayerGroup: PlayerSchema[],
}

export default function InspectKeeper({
    cardState, 
    table, 
    localPlayer, 
    playEffect,
    startDuel,
    discardKeeper,
    inspectKeeper,
    selectedKeeperGroup,
    selectedPlayerGroup,
}: Props) {
    const { user } = useContext(UserContext);

    const [playErrors, setPlayErrors] = useState<string[]>([]);
    const [discardErrors, setDiscardErrors] = useState<string[]>([]);
    const clearPlayErrors = () => setPlayErrors(() => []);
    const clearDiscardErrors = () => setDiscardErrors(() => []);

    const checkUseIfNeedSelect = () => {
        const player = getPlayer(table.players, user?.uid ?? '');
        if(cardState.state.id === "KE04") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.subtype !== "LIVING"
            || selectedKeeperGroup[0].playerIndex === player.index
            && !selectedKeeperGroup[0].state.attachment) return false;
        } else if(cardState.state.id === "KR07") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.subtype !== "EQUIPMENT"
            || selectedKeeperGroup[0].playerIndex === player.index
            && !selectedKeeperGroup[0].state.attachment) return false;
        } else if(cardState.state.id === "KL07") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.subtype !== "RUNE"
            || selectedKeeperGroup[0].playerIndex === player.index
            && !selectedKeeperGroup[0].state.attachment) return false;
        } else if(cardState.state.id === "KE05") {
            if(!selectedPlayerGroup.length) return false;
            if(selectedPlayerGroup[0].user.uid === player.state.user.uid) return false;
        } else if(cardState.state.id === "K02") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.id !== "CR02"
            && selectedKeeperGroup[0].state.attachment?.id !== "CR02") return false;
        } else if(cardState.state.id === "KE02") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.id !== "CR01"
            && selectedKeeperGroup[0].state.attachment?.id !== "CR01") return false;
        } else if(cardState.state.id === "KL06") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.id !== "CR03"
            && selectedKeeperGroup[0].state.attachment?.id !== "CR03") return false;
        } else if(cardState.state.id === "KLM01") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.id !== "KLM04"
            && selectedKeeperGroup[0].state.id !== "KLM05") return false;
        } else if(cardState.state.id === "KLM02") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.id !== "KLM03"
            && selectedKeeperGroup[0].state.id !== "KLM06") return false;
        } else if(cardState.state.id === "KLM03") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.id !== "KLM01"
            && selectedKeeperGroup[0].state.id !== "KLM05") return false;
        } else if(cardState.state.id === "KLM04") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.id !== "KLM02"
            && selectedKeeperGroup[0].state.id !== "KLM06") return false;
        } else if(cardState.state.id === "KLM05") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.id !== "KLM02"
            && selectedKeeperGroup[0].state.id !== "KLM04") return false;
        } else if(cardState.state.id === "KLM06") {
            if(!selectedKeeperGroup.length) return false;
            if(selectedKeeperGroup[0].state.id !== "KLM01"
            && selectedKeeperGroup[0].state.id !== "KLM03") return false;
        }

        return true;
    }

    const checkIfPlayDisabled = () => {
        const isOnCooldown = cardState.state.cooldown ? true : false;
        const hasEffect = cardState.state.effects ? true : false;
        const isYours       = (localPlayer.keepers.length > cardState.index 
            ?  localPlayer.keepers[cardState.index].id === cardState.state.id
            : false);
        const isTurn = table.turn.player === localPlayer.user.uid;
        const areConditionsCorrect = checkUseIfNeedSelect();
        if(isOnCooldown || !hasEffect || !isYours || !isTurn || !areConditionsCorrect) {
            return [isOnCooldown, hasEffect, isYours, isTurn, areConditionsCorrect];
        }

        return false;
    }

    const displayPlayErrors = (errors: boolean[]) => {
        const errorMessages: string[] = [];
        if(errors[0]) {
            errorMessages.push("On Cooldown.");
        }
        if(errors[1] === false) {
            errorMessages.push("This Keeper has no effects.");
        }
        if(errors[2] === false) {
            errorMessages.push("That Keeper is not yours!");
        }
        if(errors[3] === false) {
            errorMessages.push("Please wait your turn..");
        }
        if(errors[4] === false) {
            errorMessages.push("Select the correct kind of target.");
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

    const checkIfChallengeDisabled = () => {
        const isTurn = user?.uid === table.turn.player;
        const isYours = table.players[cardState.playerIndex].user.uid === user?.uid;
        const isOnCooldown = table.turn.duel.cooldown;
        const isCorrectLocation = table.rules.location === "WILDERNESS";

        if(!isTurn || isYours || isOnCooldown || !isCorrectLocation) {
            return [isTurn, isYours, isOnCooldown, isCorrectLocation];
        }
        return false;
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
                    player={table.players[cardState.playerIndex]}
                />
                <div className={`play_btn_group__card length_${table.rules.location === "WILDERNESS" ? "3" : "2"}`}>
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
                    {
                    table.rules.location === "WILDERNESS"
                    &&
                    <button
                        className={`challenge_btn__card ${table.pending || checkIfChallengeDisabled() ? "disabled" : ""}`}
                        onClick={() => { 
                            if(table.pending) return;
                            const isError = checkIfChallengeDisabled();
                            if(isError) return /**add later*/;
                            startDuel(table.players[cardState.playerIndex].user.uid, cardState);
                        }}
                    >
                        Challenge
                    </button>
                    }
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