import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import UserAccountBox from '../components/UserAccountBox';
import roomFunctions from '../utils/roomFunctions'
import UserContext from '../data/Context';
import RoomSchema from '../schemas/RoomSchema';
import UserSchema from '../schemas/userSchema';
import Header from '../components/Header';

export default function Lobby() {
    const { createRoom, getRooms, joinRoom, leaveRoom, destroyRoom, readyUp, connectRoom } = roomFunctions;
    const { db, user, joinedGameID, setJoinedGameID, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [rooms, setRooms] = useState<RoomSchema[]>([]);
    const [isAllReady, setIsAllReady] = useState(false);
    const [refreshCD, setRefreshCD] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    useEffect(() => {
        if(!user) return navigate('/');
        if(!rooms.length) setTimeout(() => {
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

    const getCurrentRoom = () => {
        for(const room of rooms) {
            if(room.id === joinedGameID) return room;
        }
        return null;
    }

    const mapRooms = () => {
        return rooms.map((room, ind) => {
            return (
                <div 
                    key={`room_${ind}`}
                    className='room_link' 
                    onClick={() => {
                        joinRoom(db, room.id, user ?? {} as UserSchema, setJoinedGameID, setRooms, setIsAllReady);
                    }}
                >
                    <p>{room.users[0].username}</p>
                    <p>{Array.isArray(room.game.players) && room.game.players.length} / 4 Players</p>
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
        return yourRoom.users.map((player, ind) => {
            return (
                <div
                    key={`lobby_player__${ind}`}
                    className='lobby_player'
                >
                    <p>{ind + 1}). {player.username} {player.isReady ? <span className='check ready_mark' /> : <span className='cross ready_mark'/> }</p>
                    {
                    user?.uid === player.uid
                    &&
                    <button
                        className='lobby_link'
                        onClick={() => {
                            if(!user) return;
                            if(user.uid === joinedGameID) destroyRoom(db, joinedGameID, setJoinedGameID);
                            else leaveRoom(db, joinedGameID, user, setJoinedGameID);
                        }}
                    >
                        Leave
                    </button>
                    }
                </div>
            )
        });
    }
    
    return !joinedGameID ? (
        <div className='main_menu'>
            <Header
                pageType='LOBBY'
            />
            <UserAccountBox />
            <div className='menu lobby'>
                <div className='refresh_btn__container' >
                    <button
                        className={`refresh_btn ${refreshCD ? "disabled" : ""}`}
                        onClick={() => {
                            if(!user || refreshCD) return;
                            getRooms(db, user?.uid, setRooms, setJoinedGameID);
                            setRefreshCD(() => true);
                            setTimeout(() => setRefreshCD(() => false), 15000);
                        }}
                    />
                </div>
                { rooms.length 
                    ? mapRooms() 
                    : (
                        <div>
                            <h3 style={{textAlign: "center"}} >
                                No Rooms
                            </h3>
                        </div>
                    )
                }
                <button
                    style={{width: "50%", alignSelf: "center"}}
                    className='lobby_link'
                    onClick={() => createRoom(db, user, setJoinedGameID, setRooms, setIsAllReady)}
                >
                    Create Game
                </button>
            </div>
        </div>
    ) : (
        <div className='main_menu'>
            <UserAccountBox />
            <div className='menu lobby'>
                <h2>Current Session: { getCurrentRoom()?.users[0].username }</h2>
                { mapRoomPlayers() }
                <button
                    style={{marginTop: "1rem"}}
                    className={`lobby_link ${isPlayerReady ? "disabled" : ""}`}
                    onClick={() => {
                        setIsPlayerReady(() => true);
                        readyUp(db, joinedGameID, user ?? {} as UserSchema, setUser);
                    }}
                >
                    Ready
                </button>
            </div>
        </div>
    )
}