import { Auth, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { ref, set, get, child, Database } from 'firebase/database';
import testsettings from '../../testsettings.json';
import UserSchema from '../schemas/userSchema';
import { allCards as all_cards } from '../data/all_cards.json';

export default (() => {
    const createAccountAnon = async (
        user: {
            auth: Auth,
            setUser: React.Dispatch<React.SetStateAction<UserSchema | undefined>>,
            db: Database
        }
    ) => {
        const { auth, setUser, db } = user;
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
                        icon: "",
                        goalImages: false,
                        isReady: false,
                        stats: {
                            wins: 0,
                            played: 0,
                            totalRounds: 0
                        },
                        cardCatalog: {},
                        goalWins: {}
                    }
                    for(const card of all_cards) {
                        newUser.cardCatalog[`${card.id}`] = 0;
                    }
                    await set(reference, newUser);
                    setUser((prev: UserSchema | undefined) => Object.assign({}, prev, newUser));                   
                } else {
                    for(const card of all_cards) {
                        let hasCard = false;
                        for(const userCard in hasAccount.cardCatalog) {
                            if(userCard === card.id) hasCard = true;
                        }
                        if(!hasCard) hasAccount.cardCatalog[`${card.id}`] = 0;
                    }
                    await set(reference, hasAccount);
                    setUser((prev: UserSchema | undefined) => Object.assign({}, prev, hasAccount ? {...hasAccount} : {}));
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
            case "GOALWON":
                return uploadGoalWon(db, cardKey ?? '', cardNum ?? NaN, uid);
        }
    }

    const uploadCard = async (db: Database, cardKey: string, cardNum: number, uid: string) => {
        try {
            const userRef = ref(db, `/users/${uid}/cardCatalog/${cardKey}`);
            await set(userRef, cardNum);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadWins = async (db:Database, amount: number, uid: string) => {
        try {
            const winRef = ref(db, `/users/${uid}/stats/wins`);
            await set(winRef, amount);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadRounds = async (db: Database, amount: number, uid: string) => {
        try {
            const roundRef = ref(db, `/users/${uid}/stats/totalRounds`);
            await set(roundRef, amount);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadPlayed = async (db: Database, amount: number, uid: string) => {
        try {
            const playedRef = ref(db, `/users/${uid}/stats/played`);
            await set(playedRef, amount);
        } catch(e) {
            return console.error(e);
        }
    }

    const uploadGoalWon = async(db: Database, cardKey: string, cardNum: number, uid: string) => {
        try {
            const goalRef = ref(db, `/users/${uid}/goalWins/${cardKey}`);
            await set(goalRef, cardNum);
        } catch(e) {
            return console.error(e);
        }
    }

    const changeName = async (db: Database, name: string, uid: string) => {
        try {
            const usernameRef = ref(db, `users/${uid}/username`);
            await set(usernameRef, name);
        } catch(e) {
            return console.error(e);
        }
    }

    const changeIcon = async (db: Database, icon: string, uid: string) => {
        try {
            const iconRef = ref(db, `/users/${uid}/icon`);
            await set(iconRef, icon);
        } catch(e) {
            return console.error(e);
        }
    }

    const changeGoalSetting = async (db: Database, bool: boolean, uid: string) => {
        try {
            const settingRef = ref(db, `/users/${uid}/goalImages`);
            await set(settingRef, bool);
        } catch(e) {
            return console.error(e);
        }
    }

    const signout = async (auth: Auth) => {
        try {
            await signOut(auth);
        } catch(e) {
            return console.error(e);
        }
    }

    const testUserSignIn = (
        username: string, 
        pass: string, 
        setter: React.Dispatch<React.SetStateAction<UserSchema | undefined>>,
    ) => {
        let isUser = false;
        for(const user of testsettings.users) {
            if(user.name.toLowerCase() === username
            && user.pass.toLowerCase() === pass) isUser = true;
        }
        const cardCatalog: {[key: string]: number} = {};
        for(const card of all_cards) {
            cardCatalog[`${card.id}`] = 0;
        }

        if(isUser) setter((prev) => {
            return {
                ...prev, 
                username, 
                uid: username, 
                isReady: false, 
                goalImages: true,
                cardCatalog, 
                goalWins: {},
                icon: '',
                stats: {
                    wins: 0,
                    played: 0,
                    totalRounds: 0,
                }
            }
        });
        return isUser;
    }

    const combineUsers = async (db: Database, main: string, old: string) => {
        try {
            const mainUserRef = ref(db, `/users/${main}`);
            const oldUserRef = ref(db, `/users/`);
            await get(child(oldUserRef, `${old}`)).then(async (snapshot) => {
                const data = await snapshot.val();
                await set(mainUserRef, data);
            });
        } catch(e) {
            console.error(e);
        }
    }
    
    return {
        createAccountAnon,
        uploadStats,
        changeName,
        changeIcon,
        changeGoalSetting,
        signout,
        testUserSignIn,
        combineUsers,
    }
})();