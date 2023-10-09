import start_rules from '../data/start_rules.json';
import RuleSchema from '../schemas/ruleSchema';

type Props = {
    initRules: typeof start_rules,
    setInitRules: (type: string) => void,
    toggleShowGameSettings: () => void,
    uploadInitRules: (rules: RuleSchema) => void,
}

export default function GameSettings({
    initRules, 
    setInitRules, 
    toggleShowGameSettings,
    uploadInitRules,
}: Props) {
    return (
        <div>
            <h3 style={{textAlign: "center"}} >Initial Rules</h3>
            <ul className='game_settings' >
                <div className='init_rule_btn_group' >
                    <button
                        className='init_rule_btn'
                        onClick={() => setInitRules("LOCATION_LEFT")}
                    >
                        {"<"}
                    </button>
                    <li>Location: {initRules.location}</li>
                    <button
                        className='init_rule_btn'
                        onClick={() => setInitRules("LOCATION_RIGHT")}
                    >
                        {">"}
                    </button>
                </div>
                <div className='init_rule_btn_group' >
                    <button
                        className='init_rule_btn'
                        onClick={() => setInitRules("DRAW_DECREMENT")}
                    >
                        -
                    </button>
                    <li>Draw Amount: {initRules.drawAmount}</li>
                    <button
                        className='init_rule_btn'
                        onClick={() => setInitRules("DRAW_INCREMENT")}
                    >
                        +
                    </button>
                </div>
                <div className='init_rule_btn_group' >
                    <button
                        className='init_rule_btn'
                        onClick={() => setInitRules("PLAY_DECREMENT")}
                    >
                        -
                    </button>
                    <li>Play Amount: {initRules.playAmount}</li>
                    <button
                        className='init_rule_btn'
                        onClick={() => setInitRules("PLAY_INCREMENT")}
                    >
                        +
                    </button>
                </div>
                <div className='init_rule_btn_group' >
                    <button
                        className='init_rule_btn'
                        onClick={() => setInitRules("HAND_LIMIT_DECREMENT")}
                    >
                        -
                    </button>
                    <li>Hand Limit: {initRules.handLimit}</li>
                    <button
                        className='init_rule_btn'
                        onClick={() => setInitRules("HAND_LIMIT_INCREMENT")}
                    >
                        +
                    </button>
                </div>
                <div className='init_rule_btn_group' >
                    <button
                        className='init_rule_btn'
                        onClick={() => setInitRules("KEEPER_LIMIT_DECREMENT")}
                    >
                        -
                    </button>
                    <li>Keeper Limit: {initRules.keeperLimit}</li>
                    <button
                        className='init_rule_btn'
                        onClick={() => setInitRules("KEEPER_LIMIT_INCREMENT")}
                    >
                        +
                    </button>
                </div>
                <div className='init_rule_btn_group' >
                    <button
                        className={`init_rule_btn_bool init_rule_btn ${!initRules.teleblock ? "disabled" : ""}`}
                        onClick={() => setInitRules("TELEBLOCK_OFF")}
                    >
                        OFF
                    </button>
                    <li>Teleblock: {initRules.teleblock.toString()}</li>
                    <button
                        className={`init_rule_btn_bool init_rule_btn ${initRules.teleblock ? "disabled" : ""}`}
                        onClick={() => setInitRules("TELEBLOCK_ON")}
                    >
                        ON
                    </button>
                </div>
            </ul>
            <div className='lobby_btn_group' >
                <button
                    style={{width: "100%"}}
                    className='play_btn__card'
                    onClick={() => {
                        uploadInitRules(initRules);
                        toggleShowGameSettings();
                    }}
                >
                    Confirm
                </button>
                <button
                    style={{width: "100%"}}
                    className='discard_btn__card'
                    onClick={() => {
                        setInitRules("RESET");
                    }}
                >
                    Reset
                </button>
            </div>
        </div>
    )
}
