import { useContext } from "react"
import UserContext from '../data/Context';
import PlayerSchema from "../schemas/playerSchema";

type Props = {
    isSideBox?: boolean,
    player?: PlayerSchema
}

export default function UserAccountBox({isSideBox, player}: Props) {
    const { user } = useContext(UserContext);

    return isSideBox ? (
        <div className="user_bar">
            <p>{player?.user.username ?? "Not Signed In!"}</p>
            <p className="user_bar__uid">{player?.user.uid ?? "000000000"}</p>
        </div>
    ) : (
        <div>
            <p>{user?.username ?? "Not Signed In!"}</p>
            <p className="user_bar__uid" >{user?.uid ?? "000000000"}</p>
        </div>
    )
}