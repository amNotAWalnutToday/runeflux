export default function Deck() {
    return (
        <div className="deck_container" >
            {
                Array.from([0, 1, 2, 3, 4, 5]).map((ind) => {
                    return (
                        <div 
                            key={`deck_card__${ind}`}
                            style={{transform: `rotateZ(-3deg) translate(calc(2px * ${ind}), calc(-4px * ${ind}))`}}
                            className="card_back card deck_card">
                        </div>
                    )
                })
            }
        </div>
    )
}