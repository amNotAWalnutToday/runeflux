import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import testsettings from '../../testsettings.json';

export default (() => {
    const createAccountAnon = async (user) => {
        const { auth, setUser, db } = user;
        const localUser = user.user;
        await signInAnonymously(auth)
            .then(() => {

            });
        await onAuthStateChanged(auth, (user) => {
            if(user) {
                const uid = user.uid;
                const reference = ref(db, `users/${uid}`);
                set(reference, { username: 'Anon', uid, isReady: false });
                setUser((prev) => Object.assign({}, prev, {username: 'Anon', uid, isReady: false}));
                console.log(localUser);
                console.log(user);
            } else {
                signOut(auth);
            }
        });
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
        testUserSignIn
    }
})();