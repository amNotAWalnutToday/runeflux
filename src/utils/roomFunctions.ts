import { Database, child, onValue, remove, ref, set, get } from 'firebase/database';
import startDeckData from '../data/start_deck.json';
import allDeckData from '../data/all_cards.json';
import startRuleData from '../data/start_rules.json';
import UserSchema from '../schemas/userSchema';
import CardSchema from '../schemas/cardSchema';
import RoomSchema from '../schemas/RoomSchema';
import roomGameSchema from '../schemas/roomGameSchema';
import PlayerSchema from '../schemas/playerSchema';

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

    const convertToRoomPlayer = (player: RoomPlayer | PlayerSchema) => {
        if(!Array.isArray(player.hand) || !player.hand.length) player.hand = false;
        if(!Array.isArray(player.keepers) || !player.keepers.length) player.keepers = false;
        return player;
    }

    const createPlayer = (user: UserSchema, hand = false, keepers = false) => {
        return { user, hand, keepers }
    }

    const createUser = (
        uid: string, 
        username: string, 
        isReady: boolean
    ) => {
        const cardCatalog = {};
        const goalWins = {}
        const stats = {
            wins: 0,
            played: 0,
            totalRounds: 0
        }
        const icon = ''
        return { 
            uid, 
            username, 
            isReady,
            cardCatalog,
            goalWins,
            stats,
            icon
        };
    }

    const getPlayer = (players: RoomPlayer[], uid: string) => {
        for(let i = 0; i < players.length; i++) {
            if(uid === players[i].user.uid) return {state: players[i], index: i, error: false};
        }
        return {state: players[0], index: 0, error: true};
    }

    const getUser = (users: UserSchema[], uid: string) => {
        for(let i = 0; i < users.length; i++) {
            if(uid === users[i].uid) return {state: users[i], index: i, error: false};
        }
        return {state: users[0], index: 0, error: true};
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
            history: {
                played: false,
                discarded: false,
            },
            players: [{user: user ?? createUser("00001", "hally", false), hand: false, keepers: false}],
            goal: false,
            turn: {
                player: false,
                drawn: 0,
                played: 0,
                temporary: {
                    hand: [],
                    play: 0,
                },
                duel: {
                    cooldown: false,
                    player1: {
                        id: '',
                        num: 0
                    },
                    player2: {
                        id: '',
                        num: 0,
                    }
                }
            },
            phases: {
                morytania: 0,
                abyss: 0,
                wilderness: 0,
            },
            pending: false,
            isWon: false,
            round: 0,
        }
        for(const cardRef of startDeckData.startDeck) {
            for(const card of allDeckData.allCards) {
                if(cardRef === card.id) game.deck.pure.push(card);
            }
        }
        const room: RoomSchema = {
            game: Object.assign({}, game, {rules: startRuleData}),
            id: user?.uid ?? '',
            displayName: user?.username ?? '',
            inProgress: false,
            users: [user ?? {uid: '0'} as UserSchema]
        };
        set(reference, room);
        setJoinedGameID(user?.uid ?? '');
        connectRoom(db, user?.uid ?? '', user ?? {} as UserSchema, setRooms, setJoinedGameID, setIsAllReady);
    }

    const destroyRoom = async (
        db: Database,
        roomId: string,
        setJoinedGameID: React.Dispatch<React.SetStateAction<string>>,
    ) => {
        try {
            const roomRef = ref(db, `/games/${roomId}`);
            await remove(roomRef);
            setJoinedGameID(() => {
                return "";
            });
        } catch(e) {
            return console.error(e);
        }
    }

    const getRooms = async (
        db: Database,
        uid: string,
        setRooms: React.Dispatch<React.SetStateAction<RoomSchema[]>>,
        setJoinedGameID: React.Dispatch<React.SetStateAction<string>>,
    ) => {
        try {
            const roomsRef = ref(db);
            const rooms: RoomSchema[] = [];
            await get(child(roomsRef, '/games')).then(async(snapshot) => {
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
            const users = [...data.users];
            users.push(user);
            await set(child(roomsRef, `/games/${roomId}/users`), users);

            setJoinedGameID(roomId);
            connectRoom(db, roomId, user, setRooms, setJoinedGameID, setIsAllReady);
        });
    }

    const removePlayer = (players: PlayerSchema[] | UserSchema[], playerIndex: number) => {
        const firstHalf = players.slice(0, playerIndex);
        const lastHalf = players.slice(playerIndex + 1);
        return firstHalf.concat(lastHalf);
    }

    const leaveRoom = async (
        db: Database,
        roomId: string,
        user: UserSchema,
        setJoinedGameID: React.Dispatch<React.SetStateAction<string>>,
    ) => {
        const roomsRef = ref(db);
        await get(child(roomsRef, `/games/${roomId}/`)).then( async (snapshot) => {
            const data = await snapshot.val();
            const players = [...data.game.players];
            const playerIndex = players.findIndex((e) => e.user.uid === user.uid);
            const updatedPlayers = removePlayer(players, playerIndex);
            await set(child(roomsRef, `/games/${roomId}/game/players`), updatedPlayers);

            const users = [...data.users];
            const userIndex = users.findIndex((e) => e.uid === user.uid);
            const updatedUsers = removePlayer(users, userIndex);
            await set(child(roomsRef, `/games/${roomId}/users`), updatedUsers);
            setJoinedGameID(() => "");
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
        onValue(child(roomsRef, `/games/${roomId}/users`), async (snapshot) => {
            const data = await snapshot.val();
            await getRooms(db, user.uid, setRooms, setJoinedGameID);
            console.log(data);
            const allReady = [];
            for(const player of data) {
                if(player.isReady) allReady.push(true);
            }
            setIsAllReady((prev) => allReady.length === data.length ? true : prev);
        });
    }

    const readyUp = async (
        db: Database,
        roomId: string,
        user: UserSchema,
        setUser: React.Dispatch<React.SetStateAction<UserSchema | undefined>>,
    ) => {
        try {
            const roomsRef = ref(db);
            await get(child(roomsRef, `/games/${roomId}/users`)).then(async(snapshot) => {
                const data = await snapshot.val();
                const you = getUser(data, user.uid);
                console.log(data, you);
                const players = [...data];
                players[you.index].isReady = true;
    
                await set(child(roomsRef, `/games/${roomId}/users`), players);
                setUser((prev) => {
                    if(!prev) return;
                    return { ...prev, isReady: true }
                })
            });
        } catch(e) {
            console.error(e);
        }
    }

    const startGame = async (db: Database, gameId: string) => {
        const roomRef = ref(db, `/games/${gameId}/inProgress`);
        await set(roomRef, true);
    }

    const checkGameInProgress = async (db: Database, gameId: string) => {
        try {
            const roomRef = ref(db);
            let isInProgress = false;
            await get(child(roomRef, `/games/${gameId}/inProgress`)).then(async (snapshot) => {
                const data = await snapshot.val();
                if(data) isInProgress = true;
            });
            return isInProgress;
        } catch(e) {
            console.error(e);
        }
    }

    return {
        convertGameToRoomGame,
        convertToRoomPlayer,
        createRoom,
        destroyRoom,
        getRooms,
        joinRoom,
        leaveRoom,
        connectRoom,
        readyUp,
        startGame,
        checkGameInProgress
    }
})()
