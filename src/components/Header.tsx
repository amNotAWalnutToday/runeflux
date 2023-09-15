type Props = {
    pageType: "LOBBY"
}

export default function Header({pageType}: Props) {
    return (
        <div className="lobby_header" >
            <h1 className="header_title" >RuneFlux</h1>
            <div>
                <button
                    className="header_btn"
                >
                    Account
                </button>
                <button
                    className="header_btn"
                >
                    Card Catalog
                </button>
                <button
                    className={`header_btn ${pageType === "LOBBY" ? "selected" : ""}`}
                >
                    Lobby
                </button>
                <button
                    className="header_btn"
                >
                    Log Out
                </button>
            </div>
        </div>
    )
}
