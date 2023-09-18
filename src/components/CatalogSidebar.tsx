type Props = {
    filterByType: (type: string) => void;
    filterByWin: (byWin: boolean) => void;
    filter: string,
    playOrWon: string,
    completionPercentage: number,
}

export default function CatalogSidebar({
    filterByType,
    filterByWin,
    filter,
    playOrWon,
    completionPercentage
}: Props) {
    return (
        <div className="sidebar_container" >
            <ul>
                <li 
                    className={`maintype_li ${!filter ? "selected" : ""}`} 
                    onClick={() => filterByType("")}
                >
                    {completionPercentage}% Completion
                </li>
                <section className="keeper_section" >
                    <li 
                        className={`maintype_li ${filter === "KEEPER" ? "selected" : ""}`}
                        onClick={() => filterByType("KEEPER")}
                    >
                        Keepers
                    </li>
                    <li 
                        className={`subtype_li ${filter === "LIVING" ? "selected" : ""}`}
                        onClick={() => filterByType("LIVING")}
                    >
                        - Living
                    </li>
                    <li 
                        className={`subtype_li ${filter === "RUNE" ? "selected" : ""}`}
                        onClick={() => filterByType("RUNE")}
                    >
                        - Rune
                    </li>
                    <li 
                        className={`subtype_li ${filter === "EQUIPMENT" ? "selected" : ""}`}
                        onClick={() => filterByType("EQUIPMENT")}    
                    >
                        - Equipment
                    </li>
                </section>
                <section className="goal_section">
                    <li 
                        className={`maintype_li ${filter === "GOAL" ? "selected" : ""}`}
                        onClick={() => filterByType("GOAL")}
                    >
                        Goals
                    </li>
                    <li 
                        className={`subtype_li ${filter === "GOAL" && playOrWon === "PLAY" ? "selected" : ""}`}
                        onClick={() => filterByWin(false)}
                    >
                        - Played
                    </li>
                    <li 
                        className={`subtype_li ${filter === "GOAL" && playOrWon === "WON" ? "selected" : ""}`}
                        onClick={() => filterByWin(true)}
                    >
                        - Won
                    </li>
                </section>
                <section className="rule_section" >
                    <li 
                        className={`maintype_li ${filter === "RULE" ? "selected" : ""}`} 
                        onClick={() => filterByType("RULE")}
                    >
                        Rules
                    </li>
                    <li 
                        className={`subtype_li ${filter === "LOCATION" ? "selected" : ""}`}
                        onClick={() => filterByType("LOCATION")}
                    >
                        - Location
                    </li>
                    <li 
                        className={`subtype_li ${filter === "BASIC" ? "selected" : ""}`}
                        onClick={() => filterByType("BASIC")}
                    >
                        - Basic
                    </li>
                </section>
                <section className="action_section">
                    <li 
                        className={`maintype_li ${filter === "ACTION" ? "selected" : ""}`}
                        onClick={() => filterByType("ACTION")}
                    >
                        Actions
                    </li>
                </section>
                <section className="counter_section">
                    <li 
                        className={`maintype_li ${filter === "COUNTER" ? "selected" : ""}`}
                        onClick={() => filterByType("COUNTER")}
                    >
                        Counters
                    </li>
                </section>
                <section className="creeper_section">
                    <li 
                        className={`maintype_li ${filter === "CREEPER" ? "selected" : ""}`}
                        onClick={() => filterByType("CREEPER")}
                    >
                        Creepers
                    </li>
                </section>
            </ul>
        </div>
    )
}