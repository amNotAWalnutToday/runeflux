import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import UserAccountBox from '../components/UserAccountBox';
import roomFunctions from '../utils/roomFunctions'
import UserContext from '../data/Context';
import RoomSchema from '../schemas/RoomSchema';
import UserSchema from '../schemas/userSchema';

export default function Lobby() {
    const { createRoom, getRooms, joinRoom, readyUp, connectRoom } = roomFunctions;
    const { db, user, joinedGameID, setJoinedGameID, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [rooms, setRooms] = useState<RoomSchema[]>([]);
    const [isAllReady, setIsAllReady] = useState(false);

    useEffect(() => {
        if(!user) return navigate('/');
        setTimeout(() => {
            getRooms(db, user?.uid ?? '', setRooms, setJoinedGameID);
        }, 500);
        if(joinedGameID && user) connectRoom(db, joinedGameID, user, setRooms, setJoinedGameID, setIsAllReady);
        console.log(rooms);
        /*eslint-disable-next-line*/
    }, [joinedGameID, user]);

    useEffect(() => {
        if(isAllReady) navigate('/game');
        /*eslint-disable-next-line*/
    }, [isAllReady]);

    const mapRooms = () => {
        return rooms.map((room, ind) => {
            return (
                <div 
                    key={`room_${ind}`}
                    className='menu_link' 
                    onClick={() => {
                        joinRoom(db, room.id, user ?? {} as UserSchema, setJoinedGameID, setRooms, setIsAllReady);
                    }}
                >
                    <p>{room.id}</p>
                    <p>{Array.isArray(room.game.players) && room.game.players.length} / 4</p>
                </div>
            )
        });
    }

    const mapRoomPlayers = () => {
        let yourRoom;
        for(const room of rooms) {
            if(room.id === joinedGameID) yourRoom = room;
        }
        if(!yourRoom) return;
        return yourRoom.game.players.map((player, ind) => {
            return (
                <div
                    key={`lobby_player__${ind}`}
                >
                    <p>{ind + 1}). {player.user.username} {player.user.isReady ? 'Ready' : 'Waiting' }</p>
                </div>
            )
        });
    }
    
    return !joinedGameID ? (
        <div className='main_menu'>
            <Link to='/game'>Join?</Link>
            <UserAccountBox />
            <div className='menu'>
                { mapRooms() }
                <button
                    className='menu_link'
                    onClick={() => createRoom(db, user, setJoinedGameID, setRooms, setIsAllReady)}
                >
                    Create Game
                </button>
            </div>
        </div>
    ) : (
        <div className='main_menu'>
            <UserAccountBox />
            <div className='menu'>
                <h2>Current Session: { joinedGameID }</h2>
                { mapRoomPlayers() }
                <button
                    className='menu_link'
                    onClick={() => {
                        readyUp(db, joinedGameID, user ?? {} as UserSchema, setUser);
                    }}
                >
                    Ready
                </button>
                <button
                    onClick={() => {
                        console.log(rooms);
                    }}
                >
                    click
                </button>
            </div>
        </div>
    )
}