import roomGameSchema from "./roomGameSchema"
import UserSchema from "./userSchema";

interface RoomSchema {
    game: roomGameSchema,
    id: string,
    displayName: string,
    inProgress: boolean
    users: UserSchema[]
}

export default RoomSchema;
