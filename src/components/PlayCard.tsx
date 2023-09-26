import { useState, useContext } from 'react';
import UserContext from '../data/Context';
import CardSchema from "../schemas/cardSchema"
import GameSchema from "../schemas/gameSchema"
import Card from "./Card"
import ErrorMessage from './ErrorMessage';
import PlayerSchema from '../schemas/playerSchema';
// import gameFunctions from '../utils/gameFunctions';

// const { getInitRule } = gameFunctions;

type Props = {
    cardState: { state: CardSchema, index: number },
    table: GameSchema,
    localPlayer: PlayerSchema,
    playCard: (card: CardSchema | false, indexInHand: number) => void,
    discardCard: (cardIndex: number) => void,
    fromWormhole?: boolean,
    selectedKeeperGroup: { state: CardSchema, index: number, playerIndex: number }[],
    selectedPlayerGroup: PlayerSchema[],
    selectedRuleGroup: string[],
}

export default function PlayCard({
    cardState, 
    table, 
    localPlayer,  
    playCard, 
    discardCard,
    fromWormhole,
    selectedKeeperGroup,
    selectedPlayerGroup,
    selectedRuleGroup,
}: Props) {
    const [playErrors, setPlayErrors] = useState<string[]>([]);
    const [discardErrors, setDiscardErrors] = useState<string[]>([]);
    const { user } = useContext(UserContext);

    const checkIfPlayDisabled = () => {
        if(cardState.state.type === "COUNTER" && table.turn.player !== user?.uid) return checkIfCounterPlayDisabled();
        const { player, played, temporary } = table.turn;
        if(!fromWormhole) {
            const hasPlayed = played >= table.rules.playAmount;
            const isTurn    = player === user?.uid;
            const actionHasError = ((cardState.state.type === "ACTION" || cardState.state.type === "COUNTER" || cardState.state.subtype === "LOCATION") 
                ? checkIfActionNeedsSelection(cardState.state.id).error 
                : false);

            if(hasPlayed || !isTurn || actionHasError) {
                return [hasPlayed, isTurn, actionHasError];
            }
        } else {
            if(!temporary) return false;
            const hasPlayed = temporary?.play < 1;
            const actionHasError = ((cardState.state.type === "ACTION" || cardState.state.type === "COUNTER" || cardState.state.subtype === "LOCATION") 
                ? checkIfActionNeedsSelection(cardState.state.id).error 
                : false);

            if(hasPlayed || actionHasError) {
                return [hasPlayed, true, actionHasError];
            }
        } 

        return false;
    }

    const checkIfCounterPlayDisabled = () => {
        const { type, subtype } = table.pending && table.pending !== true ? table.pending : {type: "", subtype: ""};
        const isCardNotInPlay = table.pending ? false : true;
        const canCounter = [];
        if(cardState.state.id === "CO01" && subtype === "LOCATION" && checkCounterEffects()) canCounter.push(false);
        if(cardState.state.id === "CO02" && type === "GOAL") canCounter.push(false);
        if(cardState.state.id === "CO03" && type === "ACTION") canCounter.push(false);
        if(cardState.state.id === "CO04" && checkCounterEffects()) canCounter.push(false);
        if(cardState.state.id === "CO05" && subtype === "BASIC") canCounter.push(false);
        if(cardState.state.id === "CO06" && checkCounterEffects()) canCounter.push(false);
    
        if(isCardNotInPlay || !canCounter.length) {
            return [isCardNotInPlay, !canCounter.length ? false : true];
        }
        return false;
    }

    const checkCounterEffects = () => {
        if(!cardState.state.effects) return;
        if(!cardState.state.effects.length) return;
        if(cardState.state.id === "CO01") {
            if(cardState.state.effects.includes("TELEPORT")) return true;
        }

        if(cardState.state.id === "CO04") {
            if(cardState.state.effects.includes("STEAL_RUNE_CROSSBOW")
            || cardState.state.effects.includes("KEEPER_STEAL_CHOOSE")) return true;
        }

        if(cardState.state.id === "CO06") {
            if(cardState.state.effects.includes("DESTROY_1")) return true;
        }

        return false;
    }

    const checkIfActionNeedsSelection = (cardId: string) => {
        if(cardId === "A04" && !selectedPlayerGroup.length) return {error: false, warning: true};
        if(cardId === "A04" && selectedPlayerGroup[0].user.uid === user?.uid) return {error: true, warning: false};
        if(cardId === "A05" && !selectedRuleGroup.length) return {error: false, warning: true};
        // if(cardId === "A05" && table.rules[`${selectedRuleGroup[0]}`] === getInitRule(selectedRuleGroup[0])) return {warning: true, error: false};
        if(cardId === "A06" && !selectedRuleGroup.length) return {error: false, warning: true};
        if(cardId === "A11" && !selectedKeeperGroup.length) return {error: false, warning: true};
        if(cardId === "A11" && table.players[selectedKeeperGroup[0].playerIndex].user.uid === user?.uid) return {error: true, warning: false};
        if(cardId === "A12" && selectedKeeperGroup.length < 2) return {warning: true, error: false};
        if(cardId === "A15" && !selectedKeeperGroup.length) return { warning: true, error: false };
        if(cardId === "A15" 
        && (table.players[selectedKeeperGroup[0].playerIndex].user.uid === user?.uid)
            && (selectedKeeperGroup[0].state.type !== "CREEPER")
                && !selectedKeeperGroup[0].state.attachment) return { error: true, warning: false };
        if(cardId === "CO04" && !selectedKeeperGroup.length) return {warning: true, error: false};
        if(cardId === "CO04" && table.players[selectedKeeperGroup[0].playerIndex].user.uid === user?.uid) return {error: true, warning: false};
        if(cardId === "CO05" && !selectedRuleGroup.length) return {warning: true, error: false};
        if(cardId === "CO06" && !selectedKeeperGroup.length) return {warning: true, error: false};
        if(cardId === "CO06" 
        && (table.players[selectedKeeperGroup[0].playerIndex].user.uid === user?.uid)
            && (selectedKeeperGroup[0].state.type !== "CREEPER"
                && !selectedKeeperGroup[0].state.attachment)) return {error: true, warning: false};
        if(cardState.state.subtype === "LOCATION" && table.rules.teleblock) return {warning: true, error: false};

        return { warning: false, error: false };
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
        if(errors[2] === true) {
            errorMessages.push("Cannot select groups pertaining to yourself.");
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
                    className={`play_btn__card ${(table.pending && cardState.state.type !== "COUNTER") || checkIfPlayDisabled() ? "disabled" : ""} ${checkIfActionNeedsSelection(cardState.state.id).warning ? "warning" : ""}`}
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