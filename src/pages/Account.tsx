import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header"
import UserContext from '../data/Context';
import UserAccountBox from '../components/UserAccountBox';
import { icons } from '../data/icons.json';
import accountFunctions from '../utils/accountFunctions';

const { changeName, changeIcon } = accountFunctions;

export default function Account() {
    const { user, db, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const usernameRef = useRef<HTMLInputElement>(null);

    const [showSetName, setShowSetName] = useState(false);

    useEffect(() => {
        if(!user) return navigate('/');
        /*eslint-disable-next-line */
    }, []);
    
    const getAverage = (higher: number, lower: number) => {
        if(!user) return;
        const average = higher / lower;
        return !isNaN(average) ? average.toFixed(2) : 0;
    }

    const getRatio = () => {
        if(!user) return;
        const ratio = user.stats.wins / user.stats.played;
        return !isNaN(ratio) ? ratio.toFixed(2) : 0;
    }

    const getTotal = () => {
        if(!user) return;
        const cardsPlayed = [];
        for(const card in user.cardCatalog) {
            cardsPlayed.push(user.cardCatalog[card]);
        }
        return cardsPlayed.reduce((prev, current) => {
            return prev + current;
        }, 0);
    }

    const getUniqueCardTotal = () => {
        if(!user) return;
        let cardsPlayed = 0;
        for(const card in user?.cardCatalog) {
            if(user?.cardCatalog[card] > 0) cardsPlayed++;
        }
        return cardsPlayed;
    }

    const mapIcons = () => {
        return icons.map((icon, index) => {
            return (
                <button
                    key={`icon__${index}`}
                    className='icon_pick'
                    onClick={async () => {
                        if(!user) return;
                        await changeIcon(db, icon, user?.uid);
                        setUser((prev) => {
                            if(!prev) return;
                            return { ...prev, icon }
                        });
                    }}
                >
                    <div
                        className={`${icon} ready_mark icon`}
                    >
                    </div>
                </button>
            )
        })
    }

    return (
        <div className="main_menu" style={{flexDirection: "row", gap: "5rem"}} >
            <Header 
                pageType="ACCOUNT"
            />
            <UserAccountBox/>
            <div className="menu" >
                <div>
                    <h2 style={{textAlign: "center"}} >
                        {user?.username}
                        <span className={`icon ${user?.icon} ready_mark`} ></span>
                    </h2>
                    <hr className='card_hr__thick'/>
                    <ul className='stat_list' >
                        <div className='stat_list' >
                            <div className="li_header stat_list">
                                <li>Games</li>
                                <hr className='card_hr__thin'/>
                            </div>
                            <li>
                                Won: <span>{user?.stats.wins}</span>
                            </li>
                            <li>
                                Played: <span>{user?.stats.played}</span>
                            </li>
                            <li>
                                Win Ratio: <span>{getRatio()}</span>
                            </li>
                        </div>
                        <div className='stat_list' >
                            <div className='stat_list li_header' >
                                <li>Rounds</li>
                                <hr className='card_hr__thin' />
                            </div>
                            <li>
                                Average: <span>{getAverage(user?.stats.totalRounds ?? 0, user?.stats.played ?? 0)}</span>
                            </li>
                            <li>
                                Total: <span>{user?.stats.totalRounds}</span>
                            </li>
                        </div>
                        <div className='stat_list' >
                            <div className="stat_list li_header">
                                <li>Cards Played</li>
                                <hr className='card_hr__thin' />
                            </div>
                            <li>Unique: <span>{getUniqueCardTotal()}</span></li>
                            <li>Average: <span>{getAverage(getTotal() ?? 0, user?.stats.played ?? 0)}</span></li>
                            <li>
                                Total: <span>{getTotal()}</span>
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
            <div className='menu account_options' >
                <div >
                    <h2 style={{textAlign: "center", marginBottom: "1rem"}} >Choose Icon</h2>
                    <div className='icon_picker' >
                        {mapIcons()}
                    </div>
                </div>
                <div className='username_form' >
                    {
                    showSetName
                    &&
                    <input
                        ref={usernameRef}
                        style={{padding: "0.25rem"}}
                        className='form_input'
                        type="text"
                        maxLength={16}
                        placeholder='Username..'
                    />
                    }
                    <button
                        className='menu_link'
                        onClick={() => {
                            if(!showSetName) return setShowSetName(() => true);
                            if(!usernameRef.current || !user) return;
                            if(usernameRef.current.value.length < 3) return;
                            changeName(db, usernameRef.current?.value, user?.uid);
                            setShowSetName(() => false);
                            setUser((prev) => {
                                if(!prev) return;
                                return {
                                    ...prev,
                                    username: usernameRef.current?.value ?? 'Anon'
                                }
                            });
                        }}
                    >
                        Change Name
                    </button>
                </div>
            </div>
        </div>
    )
}
