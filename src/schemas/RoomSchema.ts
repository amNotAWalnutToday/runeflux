import roomGameSchema from "./roomGameSchema"

interface RoomSchema {
    game: roomGameSchema,
    id: string,
    displayName: string,
    inProgress: boolean
}

export default RoomSchema;
