import { useContext } from "react"
import UserContext from '../data/Context';
import PlayerSchema from "../schemas/playerSchema";

type Props = {
    isSideBox?: boolean,
    isTurn?: boolean,
    player?: PlayerSchema
}

export default function UserAccountBox({isSideBox, player, isTurn}: Props) {
    const { user } = useContext(UserContext);

    return isSideBox ? (
        <div className={`user_bar ${isTurn ? "highlight" : "" }`}>
            <p>{player?.user.username ?? "Not Signed In!"}</p>
        </div>
    ) : (
        <div className="user_bar game_user__this_user">
            <p>{user?.username ?? "Not Signed In!"}</p>
            <p className="user_bar__uid" >{user?.uid ?? "000000000"}</p>
        </div>
    )
}