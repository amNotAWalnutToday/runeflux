import { useContext } from "react"
import UserContext from '../data/Context';
import PlayerSchema from "../schemas/playerSchema";

type Props = {
    isSideBox?: boolean,
    isTurn?: boolean,
    player?: PlayerSchema,
    selectedPlayerGroup?: PlayerSchema[],
    selectPlayerGroup?: (player: PlayerSchema) => void,
}

export default function UserAccountBox({
    isSideBox, 
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

    return isSideBox ? (
        <div 
            className={`user_bar ${isTurn ? "highlight" : "" } ${checkSelected() ? "selected" : ""}`}
            onContextMenu={(e) => {
                e.preventDefault();
                if(!selectPlayerGroup) return;
                selectPlayerGroup(player ?? {} as PlayerSchema);
            }}
        >
            <p>{player?.user.username ?? "Not Signed In!"}</p>
        </div>
    ) : (
        <div className="user_bar game_user__this_user">
            <p>{user?.username ?? "Not Signed In!"}</p>
            <p className="user_bar__uid" >{user?.uid ?? "000000000"}</p>
        </div>
    )
}