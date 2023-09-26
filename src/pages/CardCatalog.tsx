import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header"
import UserAccountBox from "../components/UserAccountBox"
import CatalogSidebar from "../components/CatalogSidebar"
import { allCards as all_cards } from '../data/all_cards.json';
import Card from '../components/Card';
import CardBack from '../components/CardBack';
import UserContext from '../data/Context';
import CardSchema from '../schemas/cardSchema';

export default function CardCatalog() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [filter, setFilter] = useState("");
    const [playOrWon, setPlayOrWon] = useState<"PLAY" | "WON">("PLAY");

    useEffect(() => {
        if(!user) return navigate('/');
        /*eslint-disable-next-line*/
    }, []);

    const filterByType = (type: string) => {
        setPlayOrWon(() => "PLAY");
        setFilter(() => {
            return type;
        });
    }

    const filterByWin = (byWin = false) => {
        if(byWin) setFilter(() => "GOAL");
        setPlayOrWon(() => byWin ? "WON" : "PLAY");
    }
    
    const getCompletionPercentage = () => {
        if(!user) return 0;
        let cardsPlayed = 0;
        for(const card in user?.cardCatalog) {
            if(user?.cardCatalog[card] > 0) cardsPlayed++;
        }
        return cardsPlayed ? Math.round((cardsPlayed / all_cards.length) * 100) : 0;
    }

    const getPlayAmountStyle = (card: CardSchema) => {
        if(!user) return;
        if(user?.cardCatalog[`${card.id}`] > 499) return "golden_highlight"
        else if(user?.cardCatalog[`${card.id}`] > 249) return "silver";
        else if(user?.cardCatalog[`${card.id}`] > 49) return "brown";
        else if(user?.cardCatalog[`${card.id}`] > 0) return "black-tooltip"
    }

    const checkCardLogCon = (card: CardSchema) => {
        if(!user) return 0;
        if(playOrWon === "PLAY") return user?.cardCatalog[`${card.id}`] > 0;
        else return user.goalWins[`${card.id}`] ? user?.goalWins[`${card.id}`] > 0 : false;
    }

    const mapCards = () => {
        if(!user) return;
        return all_cards.map((card, ind) => {
            if(filter && (card.type !== filter) && (card.subtype !== filter)) return;
            return checkCardLogCon(card) ? (
                <div
                    key={`catalog_card__${ind}`}
                >
                    <Card
                        position='CATALOG'
                        cardState={{state: card, index: ind}}
                    />
                    {
                    playOrWon === "PLAY"
                    ?
                    <p 
                        className="played_amount"
                        style={{backgroundColor: `var(--${getPlayAmountStyle(card)})`}}
                    >
                        Played: {user?.cardCatalog[`${card.id}`]}
                    </p>
                    :
                    <p
                        className='played_amount'
                    >
                        Won: {user.goalWins ? user?.goalWins[`${card.id}`] : 0}
                    </p>
                    }
                </div>
            ) : (
                <CardBack 
                    key={`catalog_card__locked_${ind}`}
                    isLocked={true}
                />
            );
        });
    }

    return (
        <div className='main_menu' >
            <UserAccountBox />
            <Header 
                pageType="CATALOG"
            />
            <CatalogSidebar 
                filter={filter}
                playOrWon={playOrWon}
                filterByType={filterByType}
                filterByWin={filterByWin}
                completionPercentage={getCompletionPercentage()}
            />
            <div className='catalog'>
                { mapCards() }
            </div>
        </div>
    )
}
