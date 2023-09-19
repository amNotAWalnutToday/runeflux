import CardSchema from "../schemas/cardSchema"
import Card from "./Card";

type Props = {
    isSideWays: boolean,
    cardState: { state: CardSchema, index: number },
    inspectKeeper?: (card: { state: CardSchema, index: number, playerIndex: number } | null) => void,
    selectedKeeperGroup?: { state: CardSchema, index: number, playerIndex: number }[],
    selectKeeperGroup?: (card: { state: CardSchema, index: number, playerIndex: number }) => void,
    drawSpecificCard?: (cardIndex: number, fromDiscard?: boolean, playerId?: string) => void,
    playerNum?: number,
}

export default function MiniCard({
    cardState, 
    isSideWays, 
    inspectKeeper,
    selectKeeperGroup,
    selectedKeeperGroup,
    playerNum,
    drawSpecificCard,
}: Props) {
    const checkSelected = () => {
        if(!selectedKeeperGroup || !playerNum) return false;
        for(const keeper of selectedKeeperGroup) {
            if(keeper.playerIndex === (playerNum - 1) && keeper.index === cardState.index) {
                return true;
            }
        }
        return false;
    }

    return isSideWays ? (
        <div  
            className={`card__mini ${cardState.state.type.toLowerCase()} ${checkSelected() ? "selected" : ""}`}
            style={(cardState.state.effects && !cardState.state.cooldown) ? {background: "var(--black-shine)"} : {} }
            onClick={!cardState.state.attachment ? () => { 
                if(!playerNum || !inspectKeeper) return;
                inspectKeeper({...cardState, playerIndex: playerNum - 1})
            }
                : (e) => e.preventDefault()
            }
            onContextMenu={(e) => {
                e.preventDefault();
                if(!selectKeeperGroup) return;
                selectKeeperGroup({state: cardState.state, index: cardState.index, playerIndex: playerNum ? playerNum - 1 : 0});
            }}
        >
            <div className='card_container__inner_left'>
                <div className={`card_header__background`} >
                    <h4 className='card_header__text'
                        style={cardState.state.name.length > 10 ? {fontSize: "10px"} : {}}
                    >
                        {cardState.state.name.split(" ").join("_")}
                    </h4>
                </div>
            </div>
            <div className="card_container__inner_right" >
                <div className={`${cardState.state.name.split(" ").join("_").toLowerCase()} mini_card_image`} />
            </div>
            {
            cardState.state.attachment
            &&
            <Card
                position="CREEPER"
                cardState={{state: cardState.state.attachment ?? {} as CardSchema, index: 0}}
                inspectKeeper={inspectKeeper}
            />
            }
        </div>
    ) : (
        <div  
            className={`side_card__mini card__mini  ${cardState.state.type.toLowerCase()} ${checkSelected() ? "selected" : ""}`}
            style={(cardState.state.effects && !cardState.state.cooldown) ? {background: "var(--black-shine)"} : {} }
            onClick={!cardState.state.attachment ? () => { 
                if(drawSpecificCard) return drawSpecificCard(cardState.index);
                if(!playerNum || !inspectKeeper) return;
                inspectKeeper({...cardState, playerIndex: playerNum - 1})
            }
                : (e) => e.preventDefault()
            }
            onContextMenu={(e) => {
                e.preventDefault();
                if(!selectKeeperGroup) return;
                selectKeeperGroup({state: cardState.state, index: cardState.index, playerIndex: playerNum ? playerNum - 1 : 0});
            }}
        >
            <div className='side_card_container__inner_left'>
                <div className='side_card_header__background' >
                    <h4 className='side_card_header__text' >{cardState.state.name.split(" ").join("_")}</h4>
                </div>
            </div>
            <div className="side_card_container__inner_right" >
                <div className={`${cardState.state.name.split(" ").join("_").toLowerCase()} mini_card_image sideways`} />
            </div>
            {
            cardState.state.attachment
            &&
            <Card
                position="CREEPER"
                cardState={{state: cardState.state.attachment ?? {} as CardSchema, index: 0}}
                inspectKeeper={inspectKeeper}
            />
            }
        </div>
    )
}