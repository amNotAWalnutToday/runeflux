import RuleSchema from "../schemas/ruleSchema";

type Props = {
    rules: RuleSchema,
}

export default function GameRules({rules}: Props) {
    return (
        <div className="rules_container box_border " >
            <h2>Rules</h2>
            <hr />
            <ul>
                <li>Location: {rules.location}</li>
                <li>Draw: {rules.drawAmount}</li>
                <li>Play: {rules.playAmount}</li>
                <li>Hand Limit: {rules.handLimit}</li>
                <li>Keeper Limit: {rules.keeperLimit}</li>
                <li>{rules.teleblock ? "Teleblocked" : ""}</li>
            </ul>
        </div>
    )
}