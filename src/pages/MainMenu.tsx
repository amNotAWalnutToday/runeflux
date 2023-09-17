import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import UserContext from "../data/Context"
import accountFunctions from "../utils/accountFunctions"

export default function MainMenu() {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    const [signingIn, setSigningIn] = useState(false);

    return(
        <div className='main_menu' >
            <div className='menu'>
                {
                !user.user
                &&
                <Link
                    className='menu_link'
                    to='/login'
                >
                    Log in
                </Link>
                }
                {
                !user.user
                ?
                <button
                    className={`menu_link ${signingIn ? "disabled" : ""}`}
                    onClick={(async () => {
                        await accountFunctions.createAccountAnon(user);
                        setSigningIn(() => true);
                    })}
                >
                    { !signingIn ? "Play as Guest" : "Please Wait.." }
                </button>
                :
                <button
                    className='menu_link'
                    onClick={() => navigate('/account')}
                >
                    Continue to Game
                </button>
                }
            </div>
        </div>
    )
}
