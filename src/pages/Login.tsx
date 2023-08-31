export default function Login() {
    return(
        <div className="main_menu">
            <form className="menu" method="">
                <div className="form_container__inner">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
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
                        className="form_input"
                        type="password"
                        name="password"
                        placeholder="Enter Password.."
                    />
                </div>
                <hr />
                <div className="form_container__inner" >
                    <button className="menu_link" type="button">
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