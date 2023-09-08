import RuleSchema from "../schemas/ruleSchema";

type Props = {
    rules: RuleSchema,
    selectedRuleGroup: string[],
    selectRuleGroup: (rule: string) => void,
}

export default function GameRules({rules, selectedRuleGroup, selectRuleGroup}: Props) {
    return (
        <div style={{zIndex: 20}} className="rules_container box_border " >
            <h2>Rules</h2>
            <hr />
            <ul>
                <li 
                    className={`rule ${selectedRuleGroup.includes("location") ? "highlight" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("location");
                    }}
                >
                    Location: {rules.location}
                </li>
                <li 
                    className={`rule ${selectedRuleGroup.includes("drawAmount") ? "highlight" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("drawAmount");
                    }}
                >
                    Draw: {rules.drawAmount}
                </li>
                <li
                    className={`rule ${selectedRuleGroup.includes("playAmount") ? "highlight" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("playAmount");
                    }}
                >
                    Play: {rules.playAmount}
                </li>
                <li
                    className={`rule ${selectedRuleGroup.includes("handLimit") ? "highlight" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("handLimit");
                    }}
                >
                    Hand Limit: {rules.handLimit}
                </li>
                <li
                    className={`rule ${selectedRuleGroup.includes("keeperLimit") ? "highlight" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        selectRuleGroup("keeperLimit");
                    }}
                >
                    Keeper Limit: {rules.keeperLimit}
                </li>
                <li
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