import { createContext } from 'react';
import UserSchema from '../schemas/userSchema';

interface UserContextInterface {
    user: UserSchema | undefined,
    setUser: unknown,
    db: unknown,
    auth: unknown,
}

const UserContext = createContext({} as UserContextInterface);

export default UserContext;
