type Props = {
    filterByType: (type: string) => void;
}

export default function CatalogSidebar({filterByType}: Props) {
    return (
        <div className="sidebar_container" >
            <ul>
                <section className="keeper_section" >
                    <li 
                        className="maintype_li"
                        onClick={() => filterByType("KEEPER")}
                    >
                        Keepers
                    </li>
                    <li 
                        className="subtype_li" 
                        onClick={() => filterByType("LIVING")}
                    >
                        - Living
                    </li>
                    <li 
                        className="subtype_li" 
                        onClick={() => filterByType("RUNE")}
                    >
                        - Rune
                    </li>
                    <li 
                        className="subtype_li" 
                        onClick={() => filterByType("EQUIPMENT")}    
                    >
                        - Equipment
                    </li>
                </section>
                <section className="goal_section">
                    <li 
                        className="maintype_li" 
                        onClick={() => filterByType("GOAL")}
                    >
                        Goals
                    </li>
                </section>
                <section className="rule_section" >
                    <li 
                        className="maintype_li" 
                        onClick={() => filterByType("RULE")}
                    >
                        Rules
                    </li>
                    <li 
                        className="subtype_li"
                        onClick={() => filterByType("LOCATION")}
                    >
                        - Location
                    </li>
                    <li 
                        className="subtype_li"
                        onClick={() => filterByType("BASIC")}
                    >
                        - Basic
                    </li>
                </section>
                <section className="action_section">
                    <li 
                        className="maintype_li" 
                        onClick={() => filterByType("ACTION")}
                    >
                        Actions
                    </li>
                </section>
                <section className="counter_section">
                    <li 
                        className="maintype_li" 
                        onClick={() => filterByType("COUNTER")}
                    >
                        Counters
                    </li>
                </section>
                <section className="creeper_section">
                    <li 
                        className="maintype_li" 
                        onClick={() => filterByType("CREEPER")}
                    >
                        Creepers
                    </li>
                </section>
            </ul>
        </div>
    )
}