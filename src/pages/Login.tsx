import { useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from "../data/Context"
import accountFunctions from "../utils/accountFunctions"

export default function Login() {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    return(
        <div className="main_menu">
            <form className="menu" method="">
                <div className="form_container__inner">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        ref={usernameRef}
                        className="form_input"
                        type="text"
                        name="username"
                        placeholder="Enter Username.."
                    />
                </div>
                <div className="form_container__inner" >
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        ref={passwordRef}
                        className="form_input"
                        type="password"
                        name="password"
                        placeholder="Enter Password.."
                    />
                </div>
                <hr />
                <div className="form_container__inner" >
                    <button 
                        className="menu_link" 
                        type="button"
                        onClick={() => { 
                            const username = usernameRef.current;
                            const password = passwordRef.current;
                            if(!username || !password) return;
                            const isUser = accountFunctions.testUserSignIn(usernameRef?.current.value, passwordRef.current?.value, setUser)
                            if(isUser) navigate('/game');
                        }}
                    >
                        Sign In
                    </button>
                    <p style={{alignSelf: 'center'}}>Or</p>
                    <button
                        className="menu_link"
                        type="button"
                    >
                        Create Account
                    </button>
                </div>
            </form>
        </div>
    )
}