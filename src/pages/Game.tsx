import { useEffect, useState, useReducer, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../data/Context';
import { allCards as all_cards } from '../data/all_cards.json';
import GameSchema from '../schemas/gameSchema';
import CardSchema from '../schemas/cardSchema';
import RuleSchema from '../schemas/ruleSchema';
import TurnSchema from '../schemas/turnSchema';
import PlayerSchema from '../schemas/playerSchema';
import gameFunctions from '../utils/gameFunctions';
import roomFunctions from '../utils/roomFunctions';
import accountFunctions from '../utils/accountFunctions';
import DrawCard from '../components/DrawCard';
import UserAccountBox from '../components/UserAccountBox';
import HandOfCards from '../components/HandOfCards';
import PlayCard from '../components/PlayCard';
import GameRules from '../components/GameRules';
import EndTurn from '../components/EndTurn';
import DeckSchema from '../schemas/deckSchema';
import Table from '../components/Table';
import Card from '../components/Card';
import InspectKeeper from '../components/InspectKeeper';
import Duel from '../components/Duel';
import CardPile from '../components/CardPile';
import History from '../components/History';
import TURN_REDUCER_ACTION from '../schemas/reducers/TURN_REDUCER_ACTIONS';
import DECK_REDUCER_ACTIONS from '../schemas/reducers/DECK_REDUCER_ACTIONS';
import RULE_REDUCER_ACTIONS from '../schemas/reducers/RULE_REDUCER_ACTIONS';
import PLAYER_REDUCER_ACTIONS from '../schemas/reducers/PLAYER_REDUCER_ACTIONS';
import GOAL_REDUCER_ACTIONS from '../schemas/reducers/GOAL_REDUCER_ACTIONS';
import testsettings from '../../testsettings.json';

const { 
    loadGame, 
    getPlayer,
    getPlayerKeeper,
    getCardById,
    seperateCreepersAndKeepers,
    connectGame, 
    chooseWhoGoesFirst,
    checkShouldDiscard,
    checkForCreepers,
    checkPlayersForKeeper,
    checkIfWon,
    endTurn,
    upload,
    uploadTable,
    shuffleDeck,
    drawPhase,
    removeCard,
    turnReducer,
    deckReducer,
    rulesReducer,
    goalReducer,
    playerReducer,
} = gameFunctions;

const { uploadStats } = accountFunctions;

type Props = {
    setWinGameStats: React.Dispatch<React.SetStateAction<{
        winner: PlayerSchema | null;
        round: number;
        goal: CardSchema | null,
    }>>
}

export default function Game({setWinGameStats}: Props) {
    const { startGame, checkGameInProgress } = roomFunctions;

    const navigate = useNavigate();

    const { db, user, joinedGameID, setUser } = useContext(UserContext);
    const uploadProps = { db, gameId: joinedGameID }
    
    /*GLOBAL STATE*/
    const [table, setTable] = useState<GameSchema>(loadGame(user));
    const [rules, dispatchRules] = useReducer(rulesReducer, table.rules);
    const [deck, dispatchDeck] = useReducer(deckReducer, table.deck);
    const [turn, dispatchTurn] = useReducer(turnReducer, table.turn);
    const [players, dispatchPlayers] = useReducer(playerReducer, table.players);
    const [goal, dispatchGoal] = useReducer(goalReducer, table.goal);

    /*LOCAL STATE*/
    const [loading, setLoading] = useState(true);
    const [locationCooldown, setLocationCooldown] = useState(false);
    const [showCardPiles, setShowCardPiles] = useState({discard: false, pure: false, locations: false});
    const [showHistory, setShowHistory] = useState(false);
    const [selectedCard, setSelectedCard] = useState<{state: CardSchema, index: number} | null>(null);
    const [inspectedKeeper, setInspectedKeeper] = useState<{state: CardSchema, index: number, playerIndex: number} | null>(null);
    const [selectedRuleGroup, setSelectedRuleGroup] = useState<string[]>([]);
    const [selectedPlayerGroup, setSelectedPlayerGroup] = useState<PlayerSchema[]>([]);
    const [selectedKeeperGroup, setSelectedKeeperGroup] = useState<{ state: CardSchema, index: number, playerIndex: number }[]>([]);
    const [selectedGoalGroup, setSelectedGoalGroup] = useState<{ state: CardSchema, index: number }[]>([]);
    const [localPlayer, setLocalPlayer] = useState(getPlayer(table.players, user?.uid ?? '').state);

    const selectCard = (card: { state: CardSchema, index: number } | null) => {
        setSelectedCard((prev) => {
            if(prev === null || card === null) return card;
            else return prev.state.name === card.state.name ? null : card;
        });
        if(inspectedKeeper) {
            setInspectedKeeper(() => null);
        }
    }

    const inspectKeeper = (card: { state: CardSchema, index: number, playerIndex: number } | null) => {
        setInspectedKeeper((prev) => {
            if(prev === null || card === null) return card;
            else return prev.state.name === card.state.name ? null : card;
        });
        if(selectedCard) {
            setSelectedCard(() => null);
        }
    }

    const resetGroups = (exception?: string) => {
        if(exception !== "KEEPERS") setSelectedKeeperGroup(() => []);
        if(exception !== "PLAYERS") setSelectedPlayerGroup(() => []);
        if(exception !== "RULES") setSelectedRuleGroup(() => []);
        if(exception !== "GOALS") setSelectedGoalGroup(() => []);
    }

    const selectRuleGroup = (rule: string) => {
        setSelectedRuleGroup((prev) => {
            if(prev.includes(rule)) return [];
            return [...prev, rule];
        });
        resetGroups("RULES");
    }

    const selectKeeperGroup = (keeper: { state: CardSchema, index: number, playerIndex: number }) => {
        setSelectedKeeperGroup((prev) => {
            for(const item of prev) {
                if(item.index === keeper.index && item.playerIndex === keeper.playerIndex) return [];
            }
            return [...prev, keeper];
        });
        resetGroups("KEEPERS");
    } 

    const selectPlayerGroup = (player: PlayerSchema) => {
        setSelectedPlayerGroup((prev) => {
            for(const p of prev) {
                if(p.user.uid === player.user.uid) return [];
            }
            return [...prev, player];
        });
        resetGroups("PLAYERS");
    }

    const selectGoalGroup = (goal: { state: CardSchema, index: number }) => {
        setSelectedGoalGroup((prev) => {
            for(const g of prev) {
                if(g.state.id === goal.state.id) return [];
            }
            return [...prev, goal];
        });
        resetGroups("GOALS");
    }

    useEffect(() => {
        setTable((prev) => {
            return { ...prev, rules }
        });
    }, [rules]);

    useEffect(() => {
        setTable((prev) => {
            return { ...prev, deck }
        });
    }, [deck]);

    useEffect(() => {
        if(table.isWon) {
            let winner = { state: {} as PlayerSchema, index: 0 };
            let goalWon: CardSchema | null = null;
            const winner1 = checkIfWon(players, goal[0], rules.location);
            const winner2 = goal.length > 1 ? checkIfWon(players, goal[1], rules.location) : null;
            if(winner1) winner = getPlayer(players, winner1);
            else if(winner2) winner = getPlayer(players, winner2);
            if(winner1) goalWon = goal[0];
            else if(winner2) goalWon = goal[1]

            setWinGameStats((prev) => {
                return { ...prev, winner: winner.state ?? null, round: table.round, goal: goalWon }
            });          
            navigate('/gameover');
        }
        setTable((prev) => {
            if(prev.turn.player !== turn.player) {
                setSelectedCard(() => null);
            }
            return { ...prev, turn }
        });
        /*eslint-disable-next-line*/
    }, [turn]);

    useEffect(() => {
        setTable((prev) => {
            return { ...prev, players }
        });
        setLocalPlayer((prev) => {
            return { ...prev, ...getPlayer(players, user?.uid ?? '').state }
        });
        if(user?.uid !== turn.player) return;
        const player = getPlayer(players, user?.uid ?? '');
        if(player.state.hand.length) {
            player.state.hand.forEach((card, ind) => {
                if(card.type === "CREEPER" && !table.pending) return playCard(card, ind);
            })
        }
        turn.temporary.hand.forEach((card, ind) => {
            if(card.type === "CREEPER" && !table.pending) playTemporaryCard(card, ind);
        });
        /*eslint-disable-next-line*/
    }, [players]);

    useEffect(() => {
        setTable((prev) => {
            return { ...prev, goal }
        });
    }, [goal]);

    useEffect(() => {
        if(table.counter && table.counter !== true) {
            if(table.counter.id === "CO03") { 
                setShowCardPiles(() => ({discard: false, pure: false, locations: false}));
            }
        }
    }, [table.counter]);

    useEffect(() => {
        if(!user) return navigate('/');
        if(!loading) return;
        tableInit();

        const escapeHandler = (e: KeyboardEvent) => {
            e.preventDefault();
            if(e.key === "Escape") {
                resetGroups();
                selectCard(null);
                inspectKeeper(null);
                setShowHistory(() => false);
            } 
            if(e.key === "Tab") {
                setShowHistory(() => !showHistory);
            }
        }
        window.addEventListener("keydown", escapeHandler);
        return (() => window.removeEventListener("keydown", escapeHandler));
        /*eslint-disable-next-line*/
    }, []);

    const tableStateInit = (
        deckData: DeckSchema,
        goalData: CardSchema[],
        ruleData: RuleSchema,
        playerData: PlayerSchema[],
        turnData: TurnSchema,
        roundData: number,
        pendingData: CardSchema | false,
        counterData: CardSchema | false,
        winData: boolean,
        phaseData: {morytania: 0, abyss: 0, wilderness: 0},
        historyData: {played: {id: string, target: string[], player: string}[], discarded: string[]},
    ) => {
        if(!deckData.discard) deckData.discard = [];
        if(!deckData.pure) deckData.pure = [];
        if(!historyData.played) historyData.played = [];
        if(!historyData.discarded) historyData.discarded = []
        if(!goalData) goalData = [];
        for(const player of playerData) {
            if(!player.hand) player.hand = [];
            if(!player.keepers) player.keepers = [];
        }
        if(!turnData.temporary.hand) turnData.temporary.hand = [];

        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.INIT,
            payload: {
                init:  {...deckData},
                pile: {...deckData.pure},
                upload: uploadProps
            }
        });
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.INIT,
            payload: {
                init: [...playerData],
                playerId: playerData[0].user.uid,
                upload: uploadProps
            }
        });
        dispatchTurn({
            type: TURN_REDUCER_ACTION.INIT,
            payload: {
                init: {...turnData},
                upload: uploadProps
            }
        });
        dispatchRules({
            type: RULE_REDUCER_ACTIONS.INIT,
            payload: {
                init: {...ruleData},
                amount: 0,
                upload: uploadProps
            }
        });
        dispatchGoal({
            type: GOAL_REDUCER_ACTIONS.INIT,
            payload: {
                goals: [...goalData],
                upload: uploadProps
            }
        });
        setTable((prev) => ({
            ...prev, 
            round: roundData, 
            pending: pendingData, 
            counter: counterData, 
            isWon: winData,
            phases: phaseData,
            history: historyData,
        }));
        setLocalPlayer((prev) => {
            return { ...prev, ...getPlayer(playerData, user?.uid ?? '').state }
        });
    }

    const tableInit = async () => {
        if(!user) return navigate('/');
        await connectGame(joinedGameID, db, tableStateInit);
        if(user.uid === joinedGameID) {
            if(await checkGameInProgress(db, joinedGameID)) return;
            const firstTurn = chooseWhoGoesFirst(players);
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_SHUFFLE__PURE, 
                payload: {
                    pile: [],
                    upload: {...uploadProps}
                }
            });
            dispatchTurn({
                type: TURN_REDUCER_ACTION.CHANGE_TURN, 
                payload: {
                    player: firstTurn,
                    upload: {...uploadProps},
                }
            });
            await startGame(db, joinedGameID);
        }
        setLoading(() => false);
    }

    const startDuel = (victimId: string, card: { state: CardSchema, index: number, playerIndex: number }) => {
        dispatchTurn({
            type: TURN_REDUCER_ACTION.DUEL_BEGIN,
            payload: {
                player: user?.uid, 
                victim: victimId,
                duelCard: card,
                upload: uploadProps
            }
        });
    }

    const rollForDuel = () => {
        const isPlayer1 = user?.uid === turn.duel.player1.id;
        dispatchTurn({
            type: (isPlayer1 
                ? TURN_REDUCER_ACTION.DUEL_ROLL__PLAYER_1
                : TURN_REDUCER_ACTION.DUEL_ROLL__PLAYER_2),
            payload: {
                upload: uploadProps,
            }
        })
    }

    const endDuel = (winnerId: string) => {
        if(winnerId === turn.duel.player1.id) {
            if(!turn.duel.card) return;
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                payload: {
                    playerId: winnerId,
                    cards: [turn.duel.card.state],
                    upload: uploadProps,
                }
            });
            const updatedKeepers = removeCard(players[turn.duel.card.playerIndex].keepers, turn.duel.card.index);
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                payload: {
                    playerId: players[turn.duel.card.playerIndex].user.uid,
                    cards: [...updatedKeepers],
                    upload: uploadProps
                }
            });
        }

        dispatchTurn({
            type: TURN_REDUCER_ACTION.DUEL_END,
            payload: {
                upload: uploadProps,
            }
        });
    }

    const drawCards = () => {
        const drawn = drawPhase(table);
        if(!deck.pure || deck.pure.length < rules.drawAmount) {
            const updatedDeck = shuffleDeck([...deck.pure, ...deck.discard]);
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_REPLACE__DISCARD_TO_PURE,
                payload: {
                    pile: [...updatedDeck],
                    upload: uploadProps
                }
            });
            return;
        }
        const creepers = checkForCreepers([...deck.pure.slice(deck.pure.length - drawn)]);
        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.DECK_REMOVE__PURE_TOP,
            payload: {
                pile: [],
                amount: drawn,
                upload: uploadProps
            }
        });
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
            payload: {
                playerId: user?.uid ?? '',
                cards: creepers.length ? [...creepers] : Array.from(deck.pure.slice(deck.pure.length - drawn)),
                upload: uploadProps
            }
        });
        if(!creepers.length) {
            dispatchTurn({
                type: TURN_REDUCER_ACTION.DRAWN_ADD, 
                payload: { 
                    player: table.turn.player && table.turn.player !== true 
                        ? table.turn.player 
                        : 'a', 
                    amount: turn.drawn + drawn, 
                    upload: uploadProps
                }
            });
        } else {            
            const keepers = seperateCreepersAndKeepers(deck.pure.slice(deck.pure.length - drawn)).keepers;
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [...keepers],
                    upload: uploadProps
                }
            });
        }
    }

    const drawCardsForPlayer = (playerId: string, amount: number, fromTop: number) => {
        const player = getPlayer(players, playerId);
        let updatedDeck = Array.from(deck.pure.slice(deck.pure.length - (amount + fromTop)));
        if(fromTop > 0) {
            const ud3 = removeCard(updatedDeck, updatedDeck.length - 1);
            let ud2;
            let ud1;
            if(fromTop > 1) {
                ud2 = removeCard(ud3, updatedDeck.length - 2);
                if(fromTop > 2) {
                    ud1 = removeCard(ud2, updatedDeck.length - 3);
                }
            }
            updatedDeck = ud1 ? ud1 : ud2 ? ud2 : ud3;
        }
        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.DECK_REMOVE__PURE_TOP,
            payload: {
                pile: [],
                amount,
                upload: uploadProps
            }
        });
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
            payload: {
                playerId: player.state.user.uid ?? '',
                cards: updatedDeck,
                upload: uploadProps
            }
        });
    }

    const wormhole = (playAmount = 1, discardAmount = 0) => {
        const { creepers, keepers } = seperateCreepersAndKeepers(deck.pure.slice(deck.pure.length - (playAmount + discardAmount)));

        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.DECK_REMOVE__PURE_TOP,
            payload: {
                pile: [],
                amount: playAmount + discardAmount,
                upload: uploadProps,
            }
        })
        dispatchTurn({
            type: TURN_REDUCER_ACTION.TEMPORARY_HAND__BEGIN,
            payload: {
                cards: Array.from(deck.pure.slice(deck.pure.length - (playAmount + discardAmount))),
                amount: playAmount,
                upload: uploadProps
            }
        });
        if(!creepers.length) return;
        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
            payload: {
                pile: [...keepers],
                upload: uploadProps
            }
        });
    }

    const drawSpecificCard = (cardIndex: number, fromDiscard = false, playerId = user?.uid ?? '') => {
        const cardToDraw = fromDiscard ? deck.discard[cardIndex] : deck.pure[cardIndex];
        dispatchDeck({
            type: (!fromDiscard 
                    ? DECK_REDUCER_ACTIONS.DECK_REMOVE__PURE_SPECIFIC
                    : DECK_REDUCER_ACTIONS.DECK_REMOVE__DISCARD_SPECIFIC),
            payload: {
                pile: [],
                cardIndex,
                upload: uploadProps
            }
        });
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
            payload: {
                playerId,
                cards: [cardToDraw],
                upload: uploadProps
            }
        });
        if(!fromDiscard) {
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_SHUFFLE__PURE,
                payload: {
                    pile: [],
                    upload: uploadProps,
                }       
            });
        }
        setShowCardPiles((prev) => ({...prev, pure: false, discard: false}));
    }
    
    const discardCardFromHand = (cardIndex: number, addToDiscard = true) => {
        const updatedHand = removeCard(localPlayer.hand, cardIndex);
        if(addToDiscard){
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [localPlayer.hand[cardIndex]],
                    upload: uploadProps
                }
            });
        }

        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__REMOVE,
            payload: {
                playerId: user?.uid ?? '',
                cards: [...updatedHand],
                upload: uploadProps
            }
        });
        setSelectedCard(() => null);
    }

    const discardTemporaryCard = (cardIndex: number, addToDiscard = true) => {
        if(!turn.temporary) return;
        const { hand } = turn.temporary;
        const updatedHand = removeCard(hand, cardIndex);
        if(addToDiscard) {
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [hand[cardIndex]],
                    upload: uploadProps
                }
            });
        }

        dispatchTurn({
            type: TURN_REDUCER_ACTION.TEMPORARY_HAND_CARD__REMOVE,
            payload: {
                cards: [...updatedHand],
                upload: uploadProps
            }
        });

        setSelectedCard(() => null);
    }

    const discardCardFromPlayer = (cardIndex: number, playerId: string) => {
        const player = getPlayer(players, playerId);
        dispatchDeck({
            type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
            payload: {
                pile: [player.state.hand[cardIndex]],
                upload: uploadProps
            }
        });

        const updatedHand = removeCard(player.state.hand, cardIndex);
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__REMOVE,
            payload: {
                playerId,
                cards: [...updatedHand],
                upload: uploadProps
            }
        })

        setSelectedCard(() => null);
    }

    const discardKeeper = (cardIndex: number, addToDiscard = true) => {
        const updatedKeepers = removeCard(localPlayer.keepers, cardIndex);
        if(addToDiscard) {
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [localPlayer.keepers[cardIndex]],
                    upload: uploadProps
                }
            });
        }

        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
            payload: {
                playerId: user?.uid ?? '',
                cards: [...updatedKeepers],
                upload: uploadProps
            }
        });
        setInspectedKeeper(() => null);
    }

    const discardKeeperFromPlayer = (cardIndex: number, playerId: string, addToDiscard = true) => {
        const player = getPlayer(players, playerId);
        const updatedKeepers = removeCard(player.state.keepers, cardIndex);
        if(addToDiscard) {
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [players[player.index].keepers[cardIndex]],
                    upload: uploadProps
                }
            });
        }

        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
            payload: {
                playerId: playerId,
                cards: [...updatedKeepers],
                upload: uploadProps
            }
        });
    }

    const resetPending = () => {
        upload('PENDING', db, {cardState: false}, joinedGameID);
    }

    const checkKeepScry = (cardId: string) => {
        if(getPlayerKeeper(getPlayer(players, user?.uid ?? '').state, "KL13")
        && cardId === "A16") return true;
        return false;
    }

    const checkKeeperHistory = (cardId: string) => {
        if(getPlayerKeeper(getPlayer(players, user?.uid ?? '').state, "KL14")
        && cardId === "A17") return true;
        return false;
    }

    const getTarget = (card: CardSchema) => {
        switch(card.id) {
            case "A04":
                return selectedPlayerGroup.length ? [{ id: selectedPlayerGroup[0].user.uid, index: 0, playerIndex: 0 }] : [];
            case "A05":
                return selectedRuleGroup.length ? [{ id: selectedRuleGroup[0], index: 0, playerIndex: 0 }] : [];
            case "A06":
            case "CO05":
                return Array.from(selectedRuleGroup, (rule, index) => ({id: rule, index, playerIndex: index}));
            case "A11":
            case "A15":
            case "CO04":
            case "CO06":
                return selectedKeeperGroup.length ? [{ id: selectedKeeperGroup[0].state.id, index: selectedKeeperGroup[0].index, playerIndex: selectedKeeperGroup[0].playerIndex }] : [];
            case "A12":
                return Array.from(selectedKeeperGroup, (keeper) => ({id: keeper.state.id, index: keeper.index, playerIndex: keeper.playerIndex}));
            default: 
                return [];
        }
    }

    const uploadPlayed = (cardId: string, target: string[], username: string) => {
        const history = [...table.history.played, {id: cardId, target, player: username}];
        if(history.length > 50) history.shift();
        upload("HISTORY_PLAYED", db, {historyState: history}, joinedGameID);
    }

    const updateCatalog = (card: CardSchema) => {
        if(!user) return;
        const playedAmount = (
            user.cardCatalog[`${card.id}`] 
                ? user.cardCatalog[`${card.id}`] + 1
                : 1 
        );
        
        setUser((prev) => {
            if(!prev) return;
            return {...prev, cardCatalog: Object.assign({}, prev?.cardCatalog, {[`${card.id}`]: playedAmount})}
        });
        uploadStats("CARD", db, {cardKey: card.id, cardNum: playedAmount}, user?.uid);
    }

    const playCard = (card: CardSchema | false, indexInHand: number) => {
        if(!card) return;
        updateCatalog(card);
        const target = getTarget(card);
        if(turn.player !== user?.uid) {
            upload("COUNTER", db, {cardState: card}, joinedGameID);
            discardCardFromHand(indexInHand, checkShouldDiscard(card.type));
            return resolvePlayCard(card, target);
        }
        upload('PENDING', db, {cardState: {...card, targets: target} }, joinedGameID);
        if(indexInHand > -1
        && !checkKeepScry(card.id)
        && !checkKeeperHistory(card.id)) { 
            discardCardFromHand(indexInHand, checkShouldDiscard(card.type));
        }
        if(turn.player === user?.uid
        && card.type !== "CREEPER"
        && indexInHand > -1) {
            dispatchTurn({
                type: TURN_REDUCER_ACTION.PLAYED_ADD,
                payload: {
                    amount: turn.played + 1,
                    upload: uploadProps
                }
            });
        }
        selectCard(null);
        resolvePlayCard(card, target);
    }

    const playTemporaryCard = (card: CardSchema | false, indexInHand: number) => {
        if(!card || !table.turn.temporary) return;
        if(user?.uid !== turn.player) return;
        updateCatalog(card);
        const target = getTarget(card);
        upload('PENDING', db, {cardState: {...card, targets: getTarget(card)} }, joinedGameID);
        discardTemporaryCard(indexInHand, checkShouldDiscard(card.type));
        if(turn.player === user?.uid) {
            dispatchTurn({
                type: TURN_REDUCER_ACTION.TEMPORARY_PLAY_CHANGE,
                payload: {
                    amount: table.turn.temporary.play - 1,
                    upload: uploadProps
                }
            });
        }
        resolvePlayCard(card, target);
    }

    const resolvePlayCard = (card: CardSchema, targets: {id: string}[]) => {
        setTimeout(() => {
            if(table.counter) return;
            resetPending();
            uploadPlayed(card.id, targets.length ? Array.from(targets, (t) => t.id) : [], user?.username ?? '');
            switch(card.type) {
                case "KEEPER":
                    return playKeeperCard(card);
                case "RULE":
                    return playRuleCard(card);
                case "GOAL":
                    return playGoalCard(card);
                case "ACTION":
                    return playActionCards(card);
                case "COUNTER":
                    return playCounterCard(card);
                case "CREEPER":
                    return playCreeperCard(card);
            }
        }, 3000);
    }

    const attachCreeper = (keeper: { state: CardSchema, index: number }) => {
        const thisPlayer = getPlayer(players, user?.uid ?? '');
        const updatedKeepers = removeCard([...thisPlayer.state.keepers], keeper.index);
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
            payload: {
                playerId: user?.uid ?? '',
                cards: [...updatedKeepers],
                upload: uploadProps
            }
        });
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
            payload: {
                playerId: user?.uid ?? '',
                cards: [keeper.state],
                upload: uploadProps
            }
        });
    }

    const playCreeperCard = (card: CardSchema) => {
        const thisPlayer = getPlayer(players, user?.uid ?? '');
        if(!thisPlayer.state.keepers) return playKeeperCard(card);
        if(card.subtype === "LIVING_CREEPER") {
            let livingKeeper: {state: CardSchema, index: number} | undefined;
            thisPlayer.state.keepers.forEach((keeper, index) => {
                if(keeper.subtype === "LIVING"
                && !keeper.attachment         ) livingKeeper = {state: {...keeper}, index};
            });
            if(!livingKeeper) return playKeeperCard(card);
            livingKeeper.state.attachment = card;
            attachCreeper(livingKeeper);
        } else if(card.subtype === "EQUIPMENT_CREEPER") {
            let equipmentKeeper: {state: CardSchema, index: number} | undefined;
            thisPlayer.state.keepers.forEach((keeper, index) => {
                if(keeper.subtype === "EQUIPMENT"
                && !keeper.attachment             ) equipmentKeeper = { state: {...keeper}, index };
            });
            if(!equipmentKeeper) return playKeeperCard(card);
            equipmentKeeper.state.attachment = card;
            attachCreeper(equipmentKeeper);
        }
    }

    const playCounterCard = (card: CardSchema) => {
        const isYourTurn = user?.uid === turn.player;
        if(card.effects.includes("TELESTOP_OR_LOCATION_MISTHALIN")) {
            if(isYourTurn) {
                if(rules.teleblock) return;
                dispatchRules({
                    type: RULE_REDUCER_ACTIONS.RULE_CHANGE__LOCATION,
                    payload: {
                        location: "MISTHALIN",
                        upload: uploadProps
                    }
                });
            } else {
                upload("RULES", db, {ruleState: {...rules, location: rules.location}}, joinedGameID);
            }
        } else if(card.effects.includes("GOALSTOP_OR_GOALS_NONE")) {
            if(isYourTurn) {
                dispatchGoal({
                    type: GOAL_REDUCER_ACTIONS.GOAL_RESET,
                    payload: { goals: [], upload: uploadProps }
                });
            } else {
                upload("GOAL", db, {goalState: goal}, joinedGameID);
            }
        } else if(card.effects.includes("ACTIONSTOP_OR_DISCARD_1_ALL")) {
            if(isYourTurn) {
                players.forEach((player) => {
                    const cardToDiscard = Math.floor(Math.random() * player.hand.length);
                    discardCardFromPlayer(cardToDiscard, player.user.uid);
                });
            } else {
                uploadTable(db, table, joinedGameID);
                upload("PENDING", db, {cardState: false}, joinedGameID);
                dispatchDeck({
                    type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                    payload: {
                        pile: [card],
                        upload: uploadProps
                    }
                });
            }
        } else if(card.effects.includes("KEEPER_STEALSTOP_OR_KEEPER_STEAL")) {
            if(isYourTurn) {
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                    payload: {
                        playerId: user.uid,
                        cards: [selectedKeeperGroup[0].state],
                        upload: uploadProps,
                    }
                });
                const updatedKeepers = removeCard(players[selectedKeeperGroup[0].playerIndex].keepers, selectedKeeperGroup[0].index);
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                    payload: {
                        playerId: players[selectedKeeperGroup[0].playerIndex].user.uid,
                        cards: [...updatedKeepers],
                        upload: uploadProps
                    }
                });
            } else {
                uploadTable(db, table, joinedGameID);
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                    payload: {
                        playerId: user?.uid ?? '',
                        cards: table.pending && table.pending !== true && table.pending.targets ? [getCardById(table.pending.targets[0].id)] : [],
                        upload: uploadProps
                    }
                });
                upload("PENDING", db, {cardState: false}, joinedGameID);
                dispatchDeck({
                    type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                    payload: {
                        pile: [card],
                        upload: uploadProps
                    }
                });
            }
        } else if(card.effects.includes("RULESTOP_OR_RULE_RESET_3")) {
            if(isYourTurn) {
                for(let i = 0; i <= 3; i++) {
                    dispatchRules({
                        type: RULE_REDUCER_ACTIONS.RULE_RESET__CHOICE,
                        payload: {
                            ruleKey: selectedRuleGroup[i],
                            upload: uploadProps
                        }
                    });
                }
            } else {
                upload("RULES", db, {ruleState: rules}, joinedGameID);
            }
        } else if(card.effects.includes("KEEPER_DISCARD_REFLECT_OR_KEEPER_DISCARD")) {
            if(isYourTurn) {
                discardKeeperFromPlayer(selectedKeeperGroup[0].index, players[selectedKeeperGroup[0].playerIndex].user.uid);
            } else {
                uploadTable(db, table, joinedGameID);
                upload("PENDING", db, {cardState: false}, joinedGameID);
                const playerWhoGotCountered = getPlayer(players, turn.player !== true && turn.player ? turn.player : '');
                const randomCardIndex = Math.floor(Math.random() * playerWhoGotCountered.state.keepers.length);
                discardKeeperFromPlayer(randomCardIndex, playerWhoGotCountered.state.user.uid);
                dispatchDeck({
                    type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                    payload: {
                        pile: [card],
                        upload: uploadProps
                    }
                });
            }
        }
        upload("COUNTER", db, {cardState: false}, joinedGameID);
        resetGroups();
    }

    const playKeeperCard = (card: CardSchema) => {
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
            payload: {
                playerId: user?.uid ?? '',
                cards: [card],
                upload: uploadProps
            }
        });
    }

    const playGoalCard = (card: CardSchema) => {
        const newGoals = [];
        newGoals.push(card);
        if((goal.length && rules.location !== "ASGARNIA"    ) 
        || (rules.location === "ASGARNIA" && goal.length > 1)) {
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [goal[selectedGoalGroup[0]?.index ?? 0]],
                    upload: uploadProps
                }
            });
        }
        if(rules.location === "ASGARNIA") {
            dispatchGoal({
                type: goal.length < 2 
                    ? GOAL_REDUCER_ACTIONS.GOAL_ADD__MULTI 
                    : GOAL_REDUCER_ACTIONS.GOAL_REPLACE__MULTI,
                payload: {
                    replaceIndex: selectedGoalGroup[0]?.index ?? 0,
                    goals: newGoals,
                    upload: uploadProps
                } 
            });
        } else {
            dispatchGoal({
                type: GOAL_REDUCER_ACTIONS.GOAL_REPLACE__SINGLE,
                payload: {
                    goals: newGoals,
                    upload: uploadProps
                } 
            });
        }
        resetGroups();
    }

    const playRuleCard = (card: CardSchema) => {
        if(card.effects.includes("RULE_PLAY")) {
            const amount = card.effects[1];
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__PLAY,
                payload: {
                    amount: Number(amount),
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("RULE_DRAW")) {
            const amount = card.effects[1];
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__DRAW,
                payload: {
                    amount: Number(amount),
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("RULE_HAND_LIMIT")) {
            const amount = card.effects[1];
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__HAND_LIMIT,
                payload: {
                    amount: Number(amount),
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("RULE_KEEPER_LIMIT")) {
            const amount = card.effects[1];
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__KEEPER_LIMIT,
                payload: {
                    amount: Number(amount),
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("LOCATION")) {
            if(rules.teleblock) return;
            const location = card.effects[1];
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__LOCATION,
                payload: {
                    location,
                    upload: uploadProps
                }
            });
            if(location === "ENTRANA") entranaHandler();
        } else if(card.effects.includes("TELEBLOCK")) {
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_CHANGE__TELEBLOCK,
                payload: {
                    teleblock: true,
                    upload: uploadProps,
                }
            });
        }
        resetGroups();
    }

    const entranaHandler = () => {
        players.forEach((player) => {
            const nonEquipmentKeepers: CardSchema[] = [];
            const equipmentKeepers: CardSchema[] = [];
            player.keepers.forEach((keeper) => {
                if(keeper.subtype === "EQUIPMENT") {
                    equipmentKeepers.push(keeper);
                } else nonEquipmentKeepers.push(keeper);
            });
            
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                payload: {
                    playerId: player.user.uid,
                    cards: [...nonEquipmentKeepers],
                    upload: uploadProps
                }
            });
            dispatchDeck({
                type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                payload: {
                    pile: [...equipmentKeepers],
                    upload: uploadProps,
                }
            });
        });
    }

    const playActionCards = (card: CardSchema) => {
        if(card.effects.includes("RULES_RESET")) {
            dispatchRules({
                type: RULE_REDUCER_ACTIONS.RULE_RESET__ALL,
                payload: {
                    upload: uploadProps,
                }
            });
        } else if(card.effects.includes("TELEPORT")) teleport();
        else if(card.effects.includes("TELEPORT_SPECIFIC")) {
            setShowCardPiles((prev) => ({...prev, locations: true}));
        } else if(card.effects.includes("RULE_RESET_CHOOSE")) {
            for(let i = 0; i <= (card.effects.length > 1 ? 2 : 0); i++) {
                dispatchRules({
                    type: RULE_REDUCER_ACTIONS.RULE_RESET__CHOICE,
                    payload: {
                        ruleKey: selectedRuleGroup[i],
                        upload: uploadProps
                    }
                });
            }
        } else if(card.effects.includes("TRADE_HANDS")) {
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.TRADE_HANDS,
                payload: {
                    playerId: user?.uid ?? "",
                    targetPlayerId: selectedPlayerGroup[0].user.uid,
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("KEEPERS_TO_HAND")) {
            players.forEach((player) => {
                const keepers: CardSchema[]  = [];
                const creepers: CardSchema[] = [];
                if(!player.keepers.length) return;
                player.keepers.forEach((keeper) => {
                    if(keeper.type === "CREEPER"
                    || keeper.attachment) creepers.push(keeper);
                    else keepers.push(keeper); 
                });
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
                    payload: {
                        playerId: player.user.uid,
                        cards: [...keepers],
                        upload: uploadProps
                    }
                });
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                    payload: {
                        playerId: player.user.uid,
                        cards: [...creepers],
                        upload: uploadProps
                    }
                });
            });
        } else if(card.effects.includes("KEEPER_EXCHANGE_CHOOSE")) {
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__EXCHANGE,
                payload: {
                    playerId: "",
                    keepersToExchange: [...selectedKeeperGroup.slice(0, 2)], 
                    cards: [selectedKeeperGroup[0].state, selectedKeeperGroup[1].state],
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("KEEPER_STEAL_CHOOSE")) {
            discardKeeperFromPlayer(selectedKeeperGroup[0].index, players[selectedKeeperGroup[0].playerIndex].user.uid, false);
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                payload: {
                    playerId: user?.uid ?? "",
                    cards: [selectedKeeperGroup[0].state],
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("DRAW_2_PLAY_2")) {
            wormhole(2);
        } else if(card.effects.includes("DRAW_5_PLAY_3")) {
            wormhole(3, 2);
        } else if(card.effects.includes("DRAW_3_PLAY_2")) {
            wormhole(2, 1);
        } else if(card.effects.includes("DISCARD_1")) {
            players.forEach((player) => {
                const cardToDiscard = Math.floor(Math.random() * player.hand.length);
                discardCardFromPlayer(cardToDiscard, player.user.uid);
            });
        } else if(card.effects.includes("DRAW_1")) {
            players.forEach((player, index) => {
                drawCardsForPlayer(player.user.uid, 1, index);
            });
        } else if(card.effects.includes("DESTROY_1")) {
            discardKeeperFromPlayer(
                selectedKeeperGroup[0].index, 
                players[selectedKeeperGroup[0].playerIndex].user.uid
            );
        } else if(card.effects.includes("STEAL_RUNE_CROSSBOW")) {
            const keeper = checkPlayersForKeeper(players, "KE04");
            if(!keeper.keeper) return;
            const updatedKeepers = removeCard(players[keeper.playerIndex].keepers, keeper.index);
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__REMOVE,
                payload: {
                    playerId: players[keeper.playerIndex].user.uid,
                    cards: updatedKeepers,
                    upload: uploadProps
                }
            });
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                payload: {
                    playerId: user?.uid ?? '',
                    cards: [keeper.keeper],
                    upload: uploadProps,
                }
            });
        } else if(card.effects.includes("SUMMON_GHOST")) {
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                payload: {
                    playerId: user?.uid ?? '',
                    cards: [getCardById("KL02")],
                    upload: uploadProps
                }
            });
        } else if(card.effects.includes("DRAW_SPECIFIC_PURE")) {
            setShowCardPiles((prev) => ({...prev, pure: true}));
        } else if(card.effects.includes("DRAW_SPECIFIC_DISCARD")) {
            setShowCardPiles((prev) => ({...prev, discard: true}));
        } else if(card.effects.includes("RULE_RANDOM")) {
            cosmicHandler();
        }
        resetGroups();
    }

    const teleport = () => {
        if(rules.teleblock) return;
        dispatchRules({
            type: RULE_REDUCER_ACTIONS.RULE_CHANGE__LOCATION_RANDOM,
            payload: {
                upload: uploadProps
            }
        });  
    }

    const cosmicHandler = () => {
        const ruleActions = [
            RULE_REDUCER_ACTIONS.RULE_CHANGE__DRAW,
            RULE_REDUCER_ACTIONS.RULE_CHANGE__PLAY,
            RULE_REDUCER_ACTIONS.RULE_CHANGE__HAND_LIMIT,
            RULE_REDUCER_ACTIONS.RULE_CHANGE__KEEPER_LIMIT,
            RULE_REDUCER_ACTIONS.RULE_CHANGE__TELEBLOCK
        ]
        const ranAction = Math.floor(Math.random() * ruleActions.length);
        const amount = Math.ceil(Math.random() * 5);

        dispatchRules({
            type: ruleActions[ranAction],
            payload: {
                amount,
                teleblock: amount > 2,
                upload: uploadProps,
            }
        })
    }

    const playKeeperEffect = (keeperId: string, keeperIndex: number) => {
        const thisPlayer = getPlayer(players, user?.uid ?? '');
        if(keeperId === "KL06") {
            const discardOrDraw = Math.ceil(Math.random() * 2);
            const amount = Math.ceil(Math.random() * 2);
            if(discardOrDraw === 1) {
                drawCardsForPlayer(thisPlayer.state.user.uid, amount, 0);
            }
            else {
                for(let i = 0; i < amount; i++) { 
                    discardCardFromHand(Math.floor(Math.random() * thisPlayer.state.hand.length));
                }
            }
        } else if(keeperId === "K01") {
            drawCardsForPlayer(thisPlayer.state.user.uid, 1, 0);
        } else if(keeperId === "CR01") {
            playCard(getCardById("RL07"), -1);
        } else if(keeperId === "KE06") {
            playCard(getCardById("RL08"), -1);
        } else if(keeperId === "KR08") {
            playCard(getCardById("A01"), -1);
        } else if(keeperId === "KR02") {
            wormhole(1, 0);
        } else if(keeperId === "KE05") {
            const ran = Math.floor(Math.random() * selectedPlayerGroup[0].hand.length);
            if(!selectedPlayerGroup[0].hand) return;
            const card = selectedPlayerGroup[0].hand[ran];
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
                payload: {
                    playerId: user?.uid ?? '',
                    cards: [card],
                    upload: uploadProps
                }
            });
            const updatedHand = removeCard(selectedPlayerGroup[0].hand, ran);
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__REMOVE,
                payload: {
                    playerId: selectedPlayerGroup[0].user.uid,
                    cards: [...updatedHand],
                    upload: uploadProps
                }
            });
        } else if(
            keeperId === "KL07" || keeperId === "KR07" || keeperId === "KE04"
            || keeperId === "K02" || keeperId === "KE02"
        ) {
            // destroy cards //
            playCard(getCardById("A15"), -1);
        } else if(keeperId === "KL10") {
            playCard(getCardById("AF02"), -1);
        } else if(
            keeperId === "KLM01" || keeperId === "KLM02" || keeperId === "KLM03"
            || keeperId === "KLM04" || keeperId === "KLM05" || keeperId === "KLM06" 
        ) {
            playCard(getCardById("A11"), -1);
        } else if(keeperId === "KE01") {
            playCard(getCardById("A14"), -1);
        } else if(keeperId === "KR09") {
            playCard(getCardById("AF03"), -1);
        }

        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_COOLDOWN__SET,
            payload: {
                playerId: user?.uid ?? '',
                cooldown: true,
                cardIndex: keeperIndex,
                upload: uploadProps
            }
        });
        resetGroups();
        inspectKeeper(null);
    }

    const warp = () => {
        const warper = checkPlayersForKeeper(players, "KL12");
        if(!warper.keeper) return;
        const ran = Math.floor(Math.random() * players.length);
        if(ran === warper.playerIndex) return;
        discardKeeperFromPlayer(warper.index, players[warper.playerIndex].user.uid, false);
        dispatchPlayers({
            type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
            payload: {
                playerId: players[ran].user.uid,
                cards: [warper.keeper],
                upload: uploadProps
            }
        });
    }

    const isTurn = () => {
        if(user?.uid === turn.player) return true;
        return false;
    }

    const ghostHandler = () => {
        const chance = Math.floor(Math.random() * 101);
        if(chance <= 20) {
            dispatchPlayers({
                type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                payload: {
                    playerId: user?.uid ?? '',
                    cards: [getCardById("KL02")],
                    upload: uploadProps,
                }
            });
        }
    }

    const ghostEffectHandler = () => {
        players.forEach((player) => {
            if(!player.keepers) return;
            player.keepers.forEach((keeper, keeperIndex) => {
                if(keeper.id !== "KL02") return;
                const chance = Math.floor(Math.random() * 101);
                if(chance <= 76) {
                    const choice = Math.ceil(Math.random() * 6);
                    discardKeeperFromPlayer(keeperIndex, player.user.uid, false);
                    dispatchPlayers({
                        type: PLAYER_REDUCER_ACTIONS.KEEPER_CARDS__ADD,
                        payload: {
                            playerId: player.user.uid,
                            cards: [getCardById(`KLM0${choice}`)],
                            upload: uploadProps
                        }
                    });

                    // add card to catalog(exception) //
                    const playedAmount = (
                        player.user.cardCatalog[`KLM0${choice}`] 
                            ? player.user.cardCatalog[`KLM0${choice}`] + 1
                            : 1 
                    );
                    uploadStats("CARD", db, {cardKey: `KLM0${choice}`, cardNum: playedAmount}, player.user?.uid);
                    upload("PHASE", db, {phaseState: {location: "morytania", amount: table.phases.morytania + 1}}, joinedGameID);
                    if(table.phases.morytania > 0) return;
                    dispatchDeck({
                        type: DECK_REDUCER_ACTIONS.DECK_ADD__DISCARD_BOT,
                        payload: {
                            pile: [getCardById("GM01"), getCardById("GM02"), getCardById("GM03")],
                            upload: uploadProps
                        }
                    })
                }
            });
        });
    }

    const endTurnHandler = () => {
        if(goal.length) win();

        warp();
        setLocationCooldown(() => false);

        const thisPlayer = getPlayer(players, user?.uid ?? '');
        if(rules.location === "MISTHALIN") {
            drawCardsForPlayer(user?.uid ?? '', 1, 0);
        }
        if(rules.location === "CRANDOR") {
            const ran = Math.floor(Math.random() * thisPlayer.state.hand.length);
            discardCardFromHand(ran, true);
        }
        if(rules.location === "MORYTANIA") {
            ghostHandler();
            ghostEffectHandler();
        }
        if(rules.location === "ZANARIS") {
            cosmicHandler();
        }
        if(turn.duel.cooldown) {
            dispatchTurn({
                type: TURN_REDUCER_ACTION.DUEL_COOLDOWN,
                payload: { upload: uploadProps }
            });
        }
        
        thisPlayer.state.keepers.forEach((keeper, ind) => {
            if(keeper.cooldown) {
                dispatchPlayers({
                    type: PLAYER_REDUCER_ACTIONS.KEEPER_COOLDOWN__SET,
                    payload: {
                        playerId: user?.uid ?? '',
                        cooldown: false,
                        cardIndex: ind,
                        upload: uploadProps
                    }
                })
            } 
        });

        const isEndOfRound = endTurn(db, table.players, table.turn, dispatchTurn, joinedGameID);
        if(isEndOfRound) {
            setTable((prev) => ({...prev, round: prev.round++}));
            upload("ROUND", db, {roundState: table.round + 1}, joinedGameID);
        }
    }

    const win = () => {
        const goal1Winner = checkIfWon(players, goal[0], rules.location);
        let goal2Winner;
        if(rules.location === "ASGARNIA") {
            goal2Winner = checkIfWon(players, goal[1], rules.location);
        }

        if(goal1Winner || goal2Winner) {
            upload('WIN', db, {}, joinedGameID);
        } 
    }

    const mapPlayerBars = () => {
        return table.players.map((player: PlayerSchema, ind: number) => {
            return (
                <UserAccountBox 
                    key={`player_bar__${ind}`}
                    isSideBox={true}
                    targets={table.pending && table.pending !== true && table.pending.targets ? Array.from(table.pending.targets, (target) => target.id) : []}
                    player={player}
                    isTurn={table.turn.player === player.user.uid}
                    selectedPlayerGroup={selectedPlayerGroup}
                    selectPlayerGroup={selectPlayerGroup}
                />
            )
        })
    }

    return (
        <div className='game_container' >
            {
            `${testsettings.domain}/game` === window.location.href
            && 
            <div>
                <button
                    className='menu_link'
                    onClick={() => {
                        dispatchPlayers({
                            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
                            payload: {
                                playerId: user?.uid ?? '',
                                cards: [        {
                                    "id": "A16",
                                    "type": "ACTION",
                                    "subtype": "",
                                    "name": "Scry and Acquire",
                                    "effects": ["DRAW_SPECIFIC_PURE"],
                                    "text": "See into the future and choose a card to acquire."
                                },
                                {
                                    "id": "A17",
                                    "type": "ACTION",
                                    "subtype": "",
                                    "name": "Historical Research",
                                    "effects": ["DRAW_SPECIFIC_DISCARD"],
                                    "text": "Look through past records and find the location of a card to acquire."
                                },         {
                                    "id": "KL14",
                                    "type": "KEEPER",
                                    "subtype": "LIVING",
                                    "name": "Reldo",
                                    "effects": [],
                                    "text": "When using the Historical Records card, don't discard it."
                                },
                        ],
                                upload: uploadProps
                            }
                        });
                    }}
                >
                    action card function test
                </button>
                <button
                    onClick={() => {
                        dispatchPlayers({
                            type: PLAYER_REDUCER_ACTIONS.HAND_CARDS__ADD,
                            payload: {
                                playerId: user?.uid ?? '',
                                cards: [         {
                                    "id": "CO03",
                                    "type": "COUNTER",
                                    "subtype": "",
                                    "name": "Belay That!",
                                    "effects": ["ACTIONSTOP_OR_DISCARD_1_ALL"],
                                    "text": "Out of turn - stop another player while they are playing an action card| During turn every discards one."
                                },
                        ],
                                upload: uploadProps
                            }
                        });
                    }}
                >
                    seocnd coming
                </button>
            </div>
            }
            {   
                <Table 
                    table={table}
                    inspectKeeper={inspectKeeper}
                    selectKeeperGroup={selectKeeperGroup}
                    selectedKeeperGroup={selectedKeeperGroup}
                    selectGoalGroup={selectGoalGroup}
                    selectedGoalGroup={selectedGoalGroup}
                />
            }
            <UserAccountBox />
            <div className='user_bars__container'>
                { mapPlayerBars() }
            </div>
            <GameRules 
                rules={table.rules}
                turn={turn}
                targetedRule={table.pending && table.pending !== true && table.pending.targets ? Array.from(table.pending.targets, (rule) => rule.id) : []}
                selectRuleGroup={selectRuleGroup}
                selectedRuleGroup={selectedRuleGroup}
                wormhole={wormhole}
                isTurn={isTurn()}
                cooldown={locationCooldown}
                setCooldown={setLocationCooldown}
            />
            {
                turn.duel.player1.id
                &&
                turn.duel.player2.id
                &&
                <Duel
                    turn={turn}
                    players={players}
                    rollForDuel={rollForDuel}
                    endDuel={endDuel}
                />
            }
            {
            user?.uid === table.turn.player
            && table.turn.drawn < table.rules.drawAmount
            &&
            <DrawCard 
                drawCards={drawCards}
            />
            }
            {
            selectedCard 
            &&
            <PlayCard 
                cardState={selectedCard}
                table={table}
                localPlayer={localPlayer}
                playCard={turn.temporary.hand.length ? playTemporaryCard : playCard }
                discardCard={turn.temporary.hand.length ? discardTemporaryCard : discardCardFromHand}
                fromWormhole={turn.temporary.hand.length ? true : false}
                selectedKeeperGroup={selectedKeeperGroup}
                selectedPlayerGroup={selectedPlayerGroup}
                selectedRuleGroup={selectedRuleGroup}
            />
            }
            {
                inspectedKeeper
                &&
                <InspectKeeper
                    cardState={inspectedKeeper}
                    table={table}
                    localPlayer={localPlayer}
                    playEffect={playKeeperEffect}
                    startDuel={startDuel}
                    discardKeeper={discardKeeper}
                    inspectKeeper={inspectKeeper}
                    selectedKeeperGroup={selectedKeeperGroup}
                    selectedPlayerGroup={selectedPlayerGroup}
                />
            }
            {
            (localPlayer.hand.length && !turn.temporary.hand.length)
            || !isTurn()
            ?
            <HandOfCards 
                selectCard={selectCard}
                hand={localPlayer.hand}
            />
            : null
            }
            {
                turn.temporary.hand.length > 0
                &&
                isTurn()
                &&
                <HandOfCards
                    selectCard={selectCard}
                    hand={turn.temporary.hand}
                />
            }
            <EndTurn 
                table={table}
                localPlayer={localPlayer}
                showCardPiles={showCardPiles}
                endTurn={endTurnHandler}
            />
            {
                table.pending !== false 
                &&
                table.pending !== true
                &&
                <Card 
                    position={"PENDING"}
                    cardState={{state:  table.pending , index: 0}}
                    player={getPlayer(players, turn.player && turn.player !== true ? turn.player : '').state}
                />
            }
            {
                table.counter !== false
                && 
                table.counter !== true
                &&
                <Card
                    position={"PENDING"}
                    cardState={{state: table.counter, index: 0}}
                />
            }
            {
                table.history.played && table.history.played.length
                &&
                <div
                    className='last_played'
                    onClick={() => setShowHistory(() => !showHistory)}
                >
                    <Card
                        position='PREVIOUS_PENDING'
                        cardState={{state: getCardById(table.history.played[table.history.played.length - 1].id), index: 0}}
                    />
                </div>
            }
            {
                showCardPiles.pure
                &&
                <CardPile 
                    type={"PURE"}
                    pile={deck.pure}
                    drawSpecificCard={drawSpecificCard}
                />
            }
            {
                showCardPiles.discard
                &&
                <CardPile
                    type={"DISCARD"}
                    pile={deck.discard}
                    drawSpecificCard={drawSpecificCard}
                />
            }
            {
                showCardPiles.locations
                &&
                <CardPile 
                    type={"LOCATIONS"}
                    pile={Array.from(all_cards.filter((card) => card.subtype === "LOCATION"))}
                    drawSpecificCard={drawSpecificCard}
                    playCard={(card: CardSchema) => {
                        playCard(card, -1);
                        setShowCardPiles((prev) => ({...prev, locations: false}));
                    }}
                />
            }
            {
                showHistory
                &&
                <History 
                    history={table.history}
                />
            }
        </div>
    )
}