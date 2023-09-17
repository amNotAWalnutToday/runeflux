import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header"
import UserAccountBox from "../components/UserAccountBox"
import CatalogSidebar from "../components/CatalogSidebar"
import { startDeck as start_deck } from '../data/start_deck.json';
import Card from '../components/Card';
import CardBack from '../components/CardBack';
import UserContext from '../data/Context';

export default function CardCatalog() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [filter, setFilter] = useState("");

    useEffect(() => {
        if(!user) return navigate('/');
        /*eslint-disable-next-line*/
    }, []);

    const filterByType = (type: string) => {
        setFilter(() => {
            return type;
        });
    }
    
    const getCompletionPercentage = () => {
        if(!user) return 0;
        let cardsPlayed = 0;
        for(const card in user?.cardCatalog) {
            if(user?.cardCatalog[card] > 0) cardsPlayed++;
        }
        return cardsPlayed ? Math.round((cardsPlayed / start_deck.length) * 100) : 0;
    }

    const mapCards = () => {
        if(!user) return;
        return start_deck.map((card, ind) => {
            if(filter && (card.type !== filter) && (card.subtype !== filter)) return;
            return user.cardCatalog[`${card.id}`] > 0 ? (
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
            <Header 
                pageType="CATALOG"
            />
            <UserAccountBox />
            <CatalogSidebar 
                filter={filter}
                filterByType={filterByType}
                completionPercentage={getCompletionPercentage()}
            />
            <div className='catalog'>
                { mapCards() }
            </div>
        </div>
    )
}
