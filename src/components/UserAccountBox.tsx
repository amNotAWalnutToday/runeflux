import { useContext } from "react"
import UserContext from '../data/Context';

export default function UserAccountBox() {
    const { user } = useContext(UserContext);

    return (
        <div>
            <p>{user?.username ?? "Not Signed In!"}</p>
            <p>{user?.uid ?? "000000000"}</p>
        </div>
    )
}