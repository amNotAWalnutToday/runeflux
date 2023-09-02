import { createContext } from 'react';

interface UserContextInterface {
    user: unknown,
    setUser: unknown,
    db: unknown
}

const UserContext = createContext({} as UserContextInterface);

export default UserContext;
