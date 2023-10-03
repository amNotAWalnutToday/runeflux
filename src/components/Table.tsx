import { useContext } from 'react';
import CardSchema from "../schemas/cardSchema";
import GameSchema from "../schemas/gameSchema";
import Card from "./Card";
import MiniCard from "./MiniCard";
import UserContext from '../data/Context';

type Props = {
    table: GameSchema,
    inspectKeeper: (card: {state: CardSchema, index: number, playerIndex: number} | null) => void,
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
    const { user } = useContext(UserContext);

    const getRotation = () => {
        if(players[0].user.uid === user?.uid) return "180deg";
        if(players[1].user.uid === user?.uid) return "0deg";
        if(players[2].user.uid === user?.uid) return "270deg";
        if(players[3].user.uid === user?.uid) return "90deg";
    }

    const getGoalRotation = () => {
        if(players[0].user.uid === user?.uid) return "180deg";
        if(players[1].user.uid === user?.uid) return "0deg";
        if(players[2].user.uid === user?.uid) return "90deg";
        if(players[3].user.uid === user?.uid) return "270deg";
    }

    const getFlexDir = () => {
        if(players.length > 3) {
            if(players[2].user.uid === user?.uid
            || players[3].user.uid === user?.uid) return true;
        } else if(players.length > 2) {
            if(players[2].user.uid === user?.uid) return true;
        }
        return false;
    }

    const mapKeepers = (keepers: CardSchema[], horizontal: boolean, playerNum: number) => {
        return keepers.map((keeper, index) => {
            return (
                <MiniCard 
                    key={`table_keepers__p${playerNum}_${index}`}
                    isSideWays={horizontal}
                    targets={table.pending && table.pending !== true && table.pending.targets ? table.pending.targets : []}
                    cardState={{ state: keeper, index }}
                    inspectKeeper={inspectKeeper}
                    selectKeeperGroup={selectKeeperGroup}
                    selectedKeeperGroup={selectedKeeperGroup}
                    player={players[playerNum - 1]}
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
        <div 
            className="table_container"
            style={{
                width: getFlexDir() ? '660px' : '',
                height: getFlexDir() ? '900px' : '',
                transform: ` ${getFlexDir() ? 'translateY(-100px)' : ''} rotateZ(${getRotation()})`
            }}
        >
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
                    players[2].keepers.length
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
            <div 
                style={{
                    transform: 'translateX(9px)',
                }}
                className={`player_4_keepers keeper_container ${players[3].keepers.length > 1 ? "length_2plus" : "length_1"}`}
            >
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
            <div 
                className={`table_goals`} 
                style={{
                    position: "absolute",
                    transform: `${getFlexDir() ? 'translateX(5px)' : ''} rotateZ(${getGoalRotation()})`,
                }}
            >
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