import { Database, ref, set } from 'firebase/database';
import startDeckData from '../data/start_deck.json';
import startRuleData from '../data/start_rules.json';
import UserSchema from '../schemas/userSchema';
import CardSchema from '../schemas/cardSchema';
import RoomSchema from '../schemas/RoomSchema';
import roomGameSchema from '../schemas/roomGameSchema';

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

    const createRoom = (
        db: Database, 
        user: UserSchema | undefined,
        setJoinedGameID: React.Dispatch<React.SetStateAction<string>>,
    ) => {
        const reference = ref(db, `/games/${user?.uid}`);
        const game = {
            deck: {
                pure: [] as CardSchema[],
                discard: false,
            },
            players: [{user: user ?? { username: 'hal', uid: '000001' }, hand: false, keepers: false}],
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
    }


    return {
        convertGameToRoomGame,
        createRoom
    }
})()
