import CardSchema from "../schemas/cardSchema";
import GameSchema from "../schemas/gameSchema";
import Card from "./Card";
import MiniCard from "./MiniCard";

type Props = {
    table: GameSchema,
}

export default function Table({table}: Props) {
    const { players, goal } = table;

    const mapKeepers = (keepers: CardSchema[], horizontal: boolean) => {
        return keepers.map((keeper, index) => {
            return (
                <MiniCard 
                    isSideWays={horizontal}
                    cardState={{ state: keeper, index }}
                />
            )
        })
    }

    const mapGoals = () => {
        return goal.map((goal, index) => {
            return (
                <Card
                    position={"TABLE"}
                    cardState={{state: goal, index}}
                />
            )
        });
    }
    
    return ( 
        <div className="table_container">
            <div className={`player_1_keepers keeper_container ${players[0].keepers.length > 1 ? "length_2plus" : "length_1"}`}>
                {
                    players[0].keepers.length
                        ? mapKeepers(players[0].keepers, true)
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
                        ? mapKeepers(players[1]?.keepers, true)
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
                        ? mapKeepers(players[2].keepers, false)
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
                        ? mapKeepers(players[3].keepers, false)
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