export default function Card() {
    return(
        <div className='card'>
            <div className='card_container__inner_left'>
                <div className='card_header__background' >
                    <h4 className='card_header__text' >The_Spread</h4>
                </div>
            </div>
            <div className='card_container__inner_right'>
                <h2>Creeper</h2>
                <p>Attaches to Living</p>
                <h3>The Spread</h3>
                <hr className='card_hr__thick' />
                <p>this is some flavour text that im not using lorem for so maybe use lorem next time?</p>
                <div className='fake_img'></div>
            </div>
        </div>
    )
}