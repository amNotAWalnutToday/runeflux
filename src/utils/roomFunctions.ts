import { Database, child, onValue, ref, set, get } from 'firebase/database';
import startDeckData from '../data/start_deck.json';
import startRuleData from '../data/start_rules.json';
import UserSchema from '../schemas/userSchema';
import CardSchema from '../schemas/cardSchema';
import RoomSchema from '../schemas/RoomSchema';
import roomGameSchema from '../schemas/roomGameSchema';

interface RoomPlayer {
    hand: boolean | CardSchema[],
    keepers: boolean | CardSchema[],
    user: UserSchema
}

export default (() => {
    const convertGameToRoomGame = (game: roomGameSchema) => {
        if(Array.isArray(game.deck.discard) && !game.deck.discard.length) {
            game.deck.discard = false;
        }
        if(Array.isArray(game.goal) && !game.goal.length) {
            game.goal = false;
        }
        for(const player of game.players) {
            if(Array.isArray(player.hand) && !player.hand.length) {
                player.hand = false;
            }
            if(Array.isArray(player.keepers) && !player.keepers.length) {
                player.keepers = false;
            }
        }
        return game;
    }

    const createPlayer = (user: UserSchema, hand = false, keepers = false) => {
        return { user, hand, keepers }
    }

    const getPlayer = (players: RoomPlayer[], uid: string) => {
        for(let i = 0; i < players.length; i++) {
            if(uid === players[i].user.uid) return {state: players[i], index: i, error: false};
        }
        return {state: players[0], index: 0, error: true};
    }

    const createRoom = (
        db: Database, 
        user: UserSchema | undefined,
        setJoinedGameID: React.Dispatch<React.SetStateAction<string>>,
        setRooms: React.Dispatch<React.SetStateAction<RoomSchema[]>>,
        setIsAllReady: React.Dispatch<React.SetStateAction<boolean>>,
    ) => {
        const reference = ref(db, `/games/${user?.uid}`);
        const game = {
            deck: {
                pure: [] as CardSchema[],
                discard: false,
            },
            players: [{user: user ?? { username: 'hal', uid: '000001', isReady: false }, hand: false, keepers: false}],
            goal: false,
            round: 0,
        }
        for(const card of startDeckData.startDeck) {
            game.deck.pure.push(card);
        }
        const room: RoomSchema = {
            game: Object.assign({}, game, {rules: startRuleData}),
            id: user?.uid ?? '',
            displayName: user?.username ?? '',
            inProgress: false
        };
        set(reference, room);
        setJoinedGameID(user?.uid ?? '');
        connectRoom(db, user?.uid ?? '', user ?? {} as UserSchema, setRooms, setJoinedGameID, setIsAllReady);
    }

    const getRooms = (
        db: Database,
        uid: string,
        setRooms: React.Dispatch<React.SetStateAction<RoomSchema[]>>,
        setJoinedGameID: React.Dispatch<React.SetStateAction<string>>,
    ) => {
        try {
            const roomsRef = ref(db);
            const rooms: RoomSchema[] = [];
            get(child(roomsRef, '/games')).then(async(snapshot) => {
                const data: RoomSchema[] = await snapshot.val();
                for(const room in data) {
                    rooms.push(data[room]);
                    const isPlayer = getPlayer(data[room].game.players, uid);
                    if(!isPlayer.error) setJoinedGameID(() => data[room].id);
                }
                setRooms(rooms);            
            });
        } catch(e) {
            return "ERROR";
        }
    }

    const joinRoom = (
        db: Database,
        roomId: string,
        user: UserSchema,
        setJoinedGameID: React.Dispatch<React.SetStateAction<string>>,
        setRooms: React.Dispatch<React.SetStateAction<RoomSchema[]>>,
        setIsAllReady: React.Dispatch<React.SetStateAction<boolean>>,
    ) => {
        const roomsRef = ref(db);
        get(child(roomsRef, `/games/${roomId}/`)).then(async(snapshot) => {
            const data = await snapshot.val();
            if(data.game.players.length >= 4) return console.error('Full Room');
            for(const player of data.game.players) {
                if(player.user.uid === user.uid) return; 
            }

            const player = createPlayer(user);
            const players = [...data.game.players];
            players.push(player);
            await set(child(roomsRef, `/games/${roomId}/game/players`), players);
            setJoinedGameID(roomId);
            connectRoom(db, roomId, user, setRooms, setJoinedGameID, setIsAllReady);
        });
    }

    const connectRoom = (
        db: Database,
        roomId: string,
        user: UserSchema,
        setRooms: React.Dispatch<React.SetStateAction<RoomSchema[]>>,
        setJoinedGameID: React.Dispatch<React.SetStateAction<string>>,
        setIsAllReady: React.Dispatch<React.SetStateAction<boolean>>,
    ) => {
        const roomsRef = ref(db);
        onValue(child(roomsRef, `/games/${roomId}/game/players`), async (snapshot) => {
            const data = await snapshot.val();
            getRooms(db, user.uid, setRooms, setJoinedGameID);
            const allReady = [];
            for(const player of data) {
                if(player.user.isReady) allReady.push(true);
            }
            setIsAllReady((prev) => allReady.length === data.length ? true : prev);
        });
    }

    const readyUp = (
        db: Database,
        roomId: string,
        user: UserSchema,
        setUser: React.Dispatch<React.SetStateAction<UserSchema | undefined>>,
    ) => {
        const roomsRef = ref(db);
        get(child(roomsRef, `/games/${roomId}/game/players`)).then(async(snapshot) => {
            const data = await snapshot.val();
            const you = getPlayer(data, user.uid);
            const players = [...data];
            players[you.index].user.isReady = true;

            await set(child(roomsRef, `/games/${roomId}/game/players`), players);
            setUser((prev) => {
                if(!prev) return;
                return { ...prev, isReady: true }
            })
        });
    }


    return {
        convertGameToRoomGame,
        createRoom,
        getRooms,
        joinRoom,
        connectRoom,
        readyUp
    }
})()
