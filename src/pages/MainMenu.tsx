import { Link } from 'react-router-dom';

export default function MainMenu() {
    return(
        <div className='main_menu' >
            <div className='menu'>
                <Link
                    className='menu_link'
                    to='/login'
                >
                    Log in
                </Link>
                <Link
                    className='menu_link'
                    to='/lobby'
                >
                        Play as Guest
                </Link>
            </div>
        </div>
    )
}
