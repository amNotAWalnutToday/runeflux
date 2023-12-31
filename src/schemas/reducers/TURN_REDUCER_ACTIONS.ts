const enum TURN_REDUCER_ACTION {
    INIT,
    CHANGE_TURN,
    DRAWN_ADD,
    PLAYED_ADD,
    TEMPORARY_HAND__BEGIN,
    TEMPORARY_HAND__END,
    TEMPORARY_HAND_CARD__ADD,
    TEMPORARY_HAND_CARD__REMOVE,
    TEMPORARY_PLAY_CHANGE,
    DUEL_BEGIN,
    DUEL_ROLL__PLAYER_1,
    DUEL_ROLL__PLAYER_2,
    DUEL_END,
    DUEL_COOLDOWN,
}

export default TURN_REDUCER_ACTION;
