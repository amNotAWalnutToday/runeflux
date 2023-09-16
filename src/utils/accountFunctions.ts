import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { ref, set, get, child, Database } from 'firebase/database';
import testsettings from '../../testsettings.json';
import UserSchema from '../schemas/userSchema';
import { startDeck as start_deck } from '../data/start_deck.json';

export default (() => {
    const createAccountAnon = async (user) => {
        const { auth, setUser, db } = user;
        const localUser = user.user;
        await signInAnonymously(auth)
            .then((a) => {
                console.log(a);
            });
        await onAuthStateChanged(auth, async (user) => {
            if(user) {
                const uid = user.uid;
                const reference = ref(db, `users/${uid}`);
                const hasAccount = await checkAccountExists(db, uid);
                if(!hasAccount) {
                    const newUser: UserSchema = {
                        username: "Anon",
                        uid,
                        isReady: false,
                        stats: {
                            wins: 0,
                            played: 0,
                            totalRounds: 0
                        },
                        cardCatalog: {}
                    }
                    for(const card of start_deck) {
                        newUser.cardCatalog[`${card.id}`] = 0;
                    }
                    await set(reference, newUser);
                    setUser((prev: UserSchema | null) => Object.assign({}, prev, newUser));                   
                } else {
                    setUser((prev: UserSchema | null) => Object.assign({}, prev, hasAccount ? {...hasAccount} : {}));
                }
            } else {
                signOut(auth);
            }
        });
    }

    const checkAccountExists = async (db: Database, userId: string): Promise<UserSchema | false> => {
        const userRef = ref(db, `/users/`);
        let isUser = false;
        await get(child(userRef, `/${userId}/`)).then(async (snapshot) => {
            const data = await snapshot.val();
            if(data) isUser = data;
        });
        return isUser;
    }

    const uploadStats = (
        type: string, 
        db: Database, 
        payload: {
            cardNum?: number,
            cardKey?: string,
            amount?: number,
        }, 
        uid: string
    ) => {
        const { cardNum, cardKey, amount } = payload;

        switch(type) {
            case "CARD":
                return uploadCard(db, cardKey ?? '', cardNum ?? NaN, uid);
            case "WINS":
                return uploadWins(db, amount ?? NaN, uid);
            case "ROUNDS":
                return uploadRounds(db, amount ?? NaN, uid);
            case "PLAYED":
                return uploadPlayed(db, amount ?? NaN, uid);
        }
    }

    const uploadCard = async (db: Database, cardKey: string, cardNum: number, uid: string) => {
        try {
            const userRef = ref(db, `/users/${uid}/cardCatalog/${cardKey}`);
            await set(userRef, cardNum);
        } catch(e) {
            return console.log(e);
        }
    }

    const uploadWins = async (db:Database, amount: number, uid: string) => {
        try {
            const winRef = ref(db, `/users/${uid}/stats/wins`);
            await set(winRef, amount);
        } catch(e) {
            return console.log(e);
        }
    }

    const uploadRounds = async (db: Database, amount: number, uid: string) => {
        try {
            const roundRef = ref(db, `/users/${uid}/stats/totalRounds`);
            await set(roundRef, amount);
        } catch(e) {
            return console.log(e);
        }
    }

    const uploadPlayed = async (db: Database, amount: number, uid: string) => {
        try {
            const playedRef = ref(db, `/users/${uid}/stats/played`);
            await set(playedRef, amount);
        } catch(e) {
            return console.log(e);
        }
    }

    const testUserSignIn = (username: string, pass: string, setter) => {
        let isUser = false;
        for(const user of testsettings.users) {
            if(user.name.toLowerCase() === username
            && user.pass.toLowerCase() === pass) isUser = true;
        }
        if(isUser) setter((prev) => ({...prev, username, uid: username, isReady: false }));
        return isUser;
    }
    
    return {
        createAccountAnon,
        uploadStats,
        testUserSignIn
    }
})();