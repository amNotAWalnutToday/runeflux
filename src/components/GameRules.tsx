import { useState } from 'react';
import RuleSchema from "../schemas/ruleSchema";
import TurnSchema from '../schemas/turnSchema';

type Props = {
    rules: RuleSchema,
    turn: TurnSchema,
    targetedRule: string[],
    selectedRuleGroup: string[],
    selectRuleGroup: (rule: string) => void,
    isTurn: boolean,
    cooldown: boolean,
    setCooldown: React.Dispatch<React.SetStateAction<boolean>>,
    wormhole: (playAmount?: number, discardAmount?: number) => void,
}

export default function GameRules({
    rules, 
    turn,
    targetedRule,
    selectedRuleGroup, 
    selectRuleGroup,
    isTurn,
    cooldown,
    setCooldown,
    wormhole,
}: Props) {
    const [isHover, setIsHover] = useState(false);
    
    const locationDescriptions = [
        "At the end of every turn draw 1 card.",
        "Double agenda(two goals) is in play here.",
        "At the end of every turn discard 1 random card",
        "Once per turn, Challenge an other players keeper for the chance to steal them",
        "Upon arriving here discard all current equipment keepers in play.",
        "10% chance to summon a ghost at the end of your turn.",
        "Once per turn, You have the option to draw 1 and play it.",
        "Each turn a random rule will randomize. Locations not included."
    ];

    const checkTargeted = (rule: string) => {
        if(!targetedRule.length) return {};
        for(const tRule of targetedRule) {
            if(rule === tRule) return {filter: "drop-shadow(0px 0px 2px var(--crimson))"};
        }
    }

    return (
        <div style={{zIndex: 20}} className="rules_container box_border " >
            <h2>Rules</h2>
            <hr />
            <ul>
                <li 
                    style={checkTargeted("location")}
                    className={`rule ${selectedRuleGroup.includes("location") ? "highlight" : ""} ${rules.location === "ABYSS" ? `location_btn ${cooldown || !isTurn ? "disabled" : ""}` : ""}`}
                    onClick={() => {
                        if(rules.location !== "ABYSS"
                        || cooldown || !isTurn) return;
                        wormhole(1, 0);
                        setCooldown(() => true);
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("location");
                    }}
                >
                    Location: {rules.location}
                    <span
                        className="location_tooltip__btn"
                        onMouseEnter={() => setIsHover(() => true)}
                        onMouseLeave={() => setIsHover(() => false)}
                    >
                        i
                    </span>
                    {
                    isHover
                    &&
                    <span
                        className="location_tooltip__text"
                    >
                        { rules.location === "MISTHALIN" ? locationDescriptions[0] : "" }
                        { rules.location === "ASGARNIA"  ? locationDescriptions[1] : "" }
                        { rules.location === "CRANDOR"   ? locationDescriptions[2] : "" }
                        { rules.location === "WILDERNESS"? locationDescriptions[3] : "" }
                        { rules.location === "ENTRANA"   ? locationDescriptions[4] : "" }
                        { rules.location === "MORYTANIA" ? locationDescriptions[5] : "" }
                        { rules.location === "ABYSS"     ? locationDescriptions[6] : "" }
                        { rules.location === "ZANARIS"   ? locationDescriptions[7] : "" }
                    </span>
                    }
                </li>
                <li 
                    style={checkTargeted("drawAmount")}
                    className={`rule ${selectedRuleGroup.includes("drawAmount") ? "highlight" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("drawAmount");
                    }}
                >
                    Draw: {turn.drawn} / {rules.drawAmount}
                </li>
                <li
                    style={checkTargeted("playAmount")}
                    className={`rule ${selectedRuleGroup.includes("playAmount") ? "highlight" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("playAmount");
                    }}
                >
                    Play: {turn.played} / {rules.playAmount}
                </li>
                <li
                    style={checkTargeted("handLimit")}
                    className={`rule ${selectedRuleGroup.includes("handLimit") ? "highlight" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("handLimit");
                    }}
                >
                    Hand Limit: {rules.handLimit}
                </li>
                <li
                    style={checkTargeted("keeperLimit")}
                    className={`rule ${selectedRuleGroup.includes("keeperLimit") ? "highlight" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("keeperLimit");
                    }}
                >
                    Keeper Limit: {rules.keeperLimit}
                </li>
                <li
                    style={checkTargeted("teleblock")}
                    className={`rule ${selectedRuleGroup.includes("teleblock") ? "highlight" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("teleblock");
                    }}
                >
                    {rules.teleblock ? "Teleblocked" : ""}
                </li>
            </ul>
        </div>
    )
}