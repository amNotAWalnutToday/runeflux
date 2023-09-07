import CardSchema from "../schemas/cardSchema"

type Props = {
    isSideWays: boolean,
    cardState: { state: CardSchema, index: number },
}

export default function MiniCard({cardState, isSideWays}: Props) {
    return isSideWays ? (
        <div  
            className={`card__mini ${cardState.state.type.toLowerCase()}`}
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