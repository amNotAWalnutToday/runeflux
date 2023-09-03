import { useContext } from 'react';
import { Link } from 'react-router-dom'
import roomFunctions from '../utils/roomFunctions'
import UserContext from '../data/Context';

export default function Lobby() {
    const { createRoom } = roomFunctions;
    const { db, user, setJoinedGameID } = useContext(UserContext);
    
    return(
        <div className='main_menu'>
            <Link to='/game'>Join?</Link>
            <div className='menu'>
                <button
                    className='menu_link'
                    onClick={() => createRoom(db, user, setJoinedGameID)}
                >
                    Create Game
                </button>
            </div>
        </div>
    )
}