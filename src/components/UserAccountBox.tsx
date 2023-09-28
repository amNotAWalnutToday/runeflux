import { useContext } from "react"
import UserContext from '../data/Context';
import PlayerSchema from "../schemas/playerSchema";

type Props = {
    isSideBox?: boolean,
    isTurn?: boolean,
    targets?: string[],
    player?: PlayerSchema,
    selectedPlayerGroup?: PlayerSchema[],
    selectPlayerGroup?: (player: PlayerSchema) => void,
}

export default function UserAccountBox({
    isSideBox, 
    targets,
    player, 
    isTurn, 
    selectedPlayerGroup,
    selectPlayerGroup,
}: Props) {
    const { user } = useContext(UserContext);

    const checkSelected = () => {
        if(!selectedPlayerGroup) return false;
        for(const selectedPlayer of selectedPlayerGroup) {
            if(selectedPlayer.user.uid === player?.user.uid) return true;
        }
        return false;
    }

    const checkTargeted = () => {
        if(!targets || !targets.length) return false;
        for(const target of targets) {
            if(target === player?.user.uid) return true;
        }
        return false;
    }

    const mapMiniHand = () => {
        if(!player?.hand) return;
        return player?.hand.map((any, ind) => {
            return (
                <span
                    key={`${any.id}_small_hand__${ind}`}
                    className="mini_hand_card"
                    style={{transform: `translate(calc(-50% * ${ind}), 50px)`}}
                >

                </span>
            )
        })
    }

    return isSideBox ? (
        <div 
            style={checkTargeted() ? {boxShadow: "inset 0px 0px 12px crimson"} : {}}
            className={`user_bar ${isTurn ? "highlight" : "" } ${checkSelected() ? "selected" : ""}`}
            onContextMenu={(e) => {
                e.preventDefault();
                if(!selectPlayerGroup) return;
                selectPlayerGroup(player ?? {} as PlayerSchema);
            }}
        >
            <p>
                {player?.user.username ?? "Not Signed In!"}
                <span className={`${player?.user.icon} ready_mark`} ></span>
                {mapMiniHand()}
            </p>
        </div>
    ) : (
        <div className="user_bar game_user__this_user">
            <p>{user?.username ?? "Not Signed In!"}</p>
            <p className="user_bar__uid" >{user?.uid ?? "000000000"}</p>
        </div>
    )
}