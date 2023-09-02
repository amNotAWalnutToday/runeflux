import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import UserContext from "../data/Context"
import accountFunctions from "../utils/accountFunctions"

export default function MainMenu() {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    return(
        <div className='main_menu' >
            <div className='menu'>
                <Link
                    className='menu_link'
                    to='/login'
                >
                    Log in
                </Link>
                <button
                    className='menu_link'
                    onClick={(async () => {
                        await accountFunctions.createAccountAnon(user);
                        navigate('/lobby')
                    })}
                >
                        Play as Guest
                </button>
            </div>
        </div>
    )
}
