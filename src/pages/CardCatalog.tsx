import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header"
import UserAccountBox from "../components/UserAccountBox"
import CatalogSidebar from "../components/CatalogSidebar"
import { startDeck as start_deck } from '../data/start_deck.json';
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
        return cardsPlayed ? Math.round((cardsPlayed / start_deck.length) * 100) : 0;
    }

    const checkCardLogCon = (card: CardSchema) => {
        if(!user) return 0;
        if(playOrWon === "PLAY") return user?.cardCatalog[`${card.id}`] > 0;
        else return user.goalWins[`${card.id}`] ? user?.goalWins[`${card.id}`] > 0 : false;
    }

    const mapCards = () => {
        if(!user) return;
        return start_deck.map((card, ind) => {
            if(filter && (card.type !== filter) && (card.subtype !== filter)) return;
            return checkCardLogCon(card) ? (
                <Card
                    key={`catalog_card__${ind}`} 
                    position='CATALOG'
                    cardState={{state: card, index: ind}}
                />
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
