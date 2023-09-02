import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';

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
                set(reference, { username: 'Anon', uid });
                setUser((prev) => Object.assign({}, prev, {username: 'Anon', uid}));
                console.log(localUser);
                console.log(user);
            } else {
                signOut(auth);
            }
        });
    }
    
    return {
        createAccountAnon
    }
})();