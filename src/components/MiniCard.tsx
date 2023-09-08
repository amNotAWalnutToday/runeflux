import CardSchema from "../schemas/cardSchema"

type Props = {
    isSideWays: boolean,
    cardState: { state: CardSchema, index: number },
    inspectKeeper: (card: { state: CardSchema, index: number } | null) => void,
    selectedKeeperGroup?: { state: CardSchema, index: number, playerIndex: number }[],
    selectKeeperGroup?: (card: { state: CardSchema, index: number, playerIndex: number }) => void,
    playerNum?: number,
}

export default function MiniCard({
    cardState, 
    isSideWays, 
    inspectKeeper,
    selectKeeperGroup,
    selectedKeeperGroup,
    playerNum,
}: Props) {
    const checkSelected = () => {
        if(!selectedKeeperGroup) return false;
        for(const keeper of selectedKeeperGroup) {
            if(keeper.playerIndex === playerNum && keeper.index === cardState.index) {
                return true;
            }
        }
        return false;
    }

    return isSideWays ? (
        <div  
            className={`card__mini ${cardState.state.type.toLowerCase()} ${checkSelected() ? "selected" : ""}`}
            onClick={() => inspectKeeper(cardState)}
            onContextMenu={(e) => {
                e.preventDefault();
                if(!selectKeeperGroup) return;
                selectKeeperGroup({state: cardState.state, index: cardState.index, playerIndex: playerNum ?? 0});
            }}
        >
            <div className='card_container__inner_left'>
                <div className={`card_header__background`} >
                    <h4 className='card_header__text' >{cardState.state.name.split(" ").join("_")}</h4>
                </div>
            </div>
            <div className="card_container__inner_right" >

            </div>
        </div>
    ) : (
        <div  
            className="side_card__mini card__mini"
        >
            <div className='side_card_container__inner_left'>
                <div className='side_card_header__background' >
                    <h4 className='side_card_header__text' >{cardState.state.name.split(" ").join("_")}</h4>
                </div>
            </div>
            <div className="side_card_container__inner_right" >

            </div>
        </div>
    )
}