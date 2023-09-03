import { createContext } from 'react';
import UserSchema from '../schemas/userSchema';
import { Database } from 'firebase/database';
import { Auth } from 'firebase/auth';

interface UserContextInterface {
    user: UserSchema | undefined,
    setUser: React.Dispatch<React.SetStateAction<UserSchema | undefined>>,
    db: Database,
    auth: Auth,
    joinedGameID: string
    setJoinedGameID: React.Dispatch<React.SetStateAction<string>>
}

const UserContext = createContext({} as UserContextInterface);

export default UserContext;
