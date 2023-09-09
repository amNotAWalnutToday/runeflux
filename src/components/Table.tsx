import CardSchema from "../schemas/cardSchema";
import GameSchema from "../schemas/gameSchema";
import Card from "./Card";
import MiniCard from "./MiniCard";

type Props = {
    table: GameSchema,
    inspectKeeper: (card: {state: CardSchema, index: number} | null) => void,
    selectedKeeperGroup: { state: CardSchema, index: number, playerIndex: number }[],
    selectKeeperGroup: (card: { state: CardSchema, index: number, playerIndex: number }) => void,
    selectedGoalGroup: { state: CardSchema, index: number }[],
    selectGoalGroup: (goal: { state: CardSchema, index: number }) => void,
}

export default function Table({
    table, 
    inspectKeeper, 
    selectKeeperGroup, 
    selectedKeeperGroup,
    selectGoalGroup,
    selectedGoalGroup,
}: Props) {
    const { players, goal } = table;

    const mapKeepers = (keepers: CardSchema[], horizontal: boolean, playerNum: number) => {
        return keepers.map((keeper, index) => {
            return (
                <MiniCard 
                    key={`table_keepers__p${playerNum}_${index}`}
                    isSideWays={horizontal}
                    cardState={{ state: keeper, index }}
                    inspectKeeper={inspectKeeper}
                    selectKeeperGroup={selectKeeperGroup}
                    selectedKeeperGroup={selectedKeeperGroup}
                    playerNum={playerNum}
                />
            )
        })
    }

    const mapGoals = () => {
        return goal.map((goal, index) => {
            return (
                <Card
                    key={`table_goals__${index}`}
                    position={"TABLE"}
                    cardState={{state: goal, index}}
                    selectGoalGroup={selectGoalGroup}
                    selectedGoalGroup={selectedGoalGroup}
                />
            )
        });
    }
    
    return ( 
        <div className="table_container">
            <div className={`player_1_keepers keeper_container ${players[0].keepers.length > 1 ? "length_2plus" : "length_1"}`}>
                {
                    players[0].keepers.length
                        ? mapKeepers(players[0].keepers, true, 1)
                        : (
                            <div className="mini_card_outline" >
                                <p>No Keeper!</p>
                            </div>
                        )
                }
            </div>
            {
            players.length > 1
            &&
            <div className={`player_2_keepers keeper_container ${players[1]?.keepers.length > 1 ? "length_2plus" : "length_1"}`}>
                {
                    players[1]?.keepers.length
                        ? mapKeepers(players[1]?.keepers, true, 2)
                        : (
                            <div className="mini_card_outline" >
                                <p>No Keeper!</p>
                            </div>
                        )
                }
            </div>
            }
            {
            players.length > 2
            &&
            <div className={`player_3_keepers keeper_container ${players[2].keepers.length > 1 ? "length_2plus" : "length_1"}`}>
                {
                    players[1].keepers.length
                        ? mapKeepers(players[2].keepers, false, 3)
                        : (
                            <div className="mini_card_outline" >
                                <p>No Keeper!</p>
                            </div>
                        )
                }
            </div>
            }
            {
            players.length > 3
            &&
            <div className={`player_4_keepers keeper_container ${players[3].keepers.length > 1 ? "length_2plus" : "length_1"}`}>
                {
                    players[3].keepers.length
                        ? mapKeepers(players[3].keepers, false, 4)
                        : (
                            <div className="mini_card_outline" >
                                <p>No Keeper!</p>
                            </div>
                        )
                }
            </div>}
            <div className="table_goals" >
                {
                    goal.length
                        ? mapGoals()
                        : (
                            <div className="card_outline" >
                                <h2 style={{color: "var(--light-pink)"}} >No Goal !</h2>
                            </div>
                        )
                }
            </div>
        </div>
    )
}