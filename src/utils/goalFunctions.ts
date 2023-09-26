import CardSchema from "../schemas/cardSchema";

export default (() => {
    const checkG01 = (keepers: CardSchema[]) => {
        const requirements = { airObj: false, mindRune: false };
            
        keepers.forEach((keeper) => {
            if(keeper.id === "KR01") requirements.mindRune = true;
            if(keeper.id === "KR03" || keeper.id === "KE03") requirements.airObj = true;
        });

        if(requirements.airObj && requirements.mindRune) return { hasWon: true, bypassCreeper: false};
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG02 = (keepers: CardSchema[]) => {
        const requirements = { ghost: false, ghostSpeak: false, fatherAereck: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL02") requirements.ghost = true;
            if(keeper.id === "KL04") requirements.fatherAereck = true;
            if(keeper.id === "KE01") requirements.ghostSpeak = true;
        });

        if(requirements.ghost && requirements.ghostSpeak && requirements.fatherAereck) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG03 = (keepers: CardSchema[]) => {
        const requirements = { dukeH: false, antifireShield: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "KL03") requirements.dukeH = true;
            if(keeper.id === "KE02") requirements.antifireShield = true;
        });

        if(requirements.antifireShield && requirements.dukeH) return { hasWon: true, bypassCreeper: false }
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG04 = (keepers: CardSchema[], location: string) => {
        const requirements = { crandor: false, elvarg: false, antifireShield: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "CR01") requirements.elvarg = true;
            if(keeper.id === "KE02") requirements.antifireShield = true;
        });

        if(location === "CRANDOR") requirements.crandor = true;

        if(requirements.crandor && requirements.elvarg && requirements.antifireShield) return { hasWon: true, bypassCreeper: true };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG05 = (keepers: CardSchema[]) => {
        const requirements = { cook: false, cake: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "K01") requirements.cake = true;
            if(keeper.id === "KL05") requirements.cook = true;
        });

        if(requirements.cook && requirements.cake) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG06 = (keepers: CardSchema[]) => {
        const requirements = { dukeH: false, cook: false, fatherAereck: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL04") requirements.fatherAereck = true;
            if(keeper.id === "KL05") requirements.cook = true;
            if(keeper.id === "KL03") requirements.dukeH = true
        });

        let number = 0;
        if(requirements.dukeH) number++;
        if(requirements.cook) number++;
        if(requirements.fatherAereck) number++;

        if(number >= 2) return { hasWon: true, bypassCreeper: false }
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG07 = (keepers: CardSchema[]) => {
        const requirements = { airR: false, fireR: false, earthR: false, waterR: false };
        /**some */
        keepers.forEach((keeper) => {
            if(keeper.id === "KR03") requirements.airR = true;
            if(keeper.id === "KR06") requirements.fireR = true;
            if(keeper.id === "KR05") requirements.earthR = true
            if(keeper.id === "KR04") requirements.waterR = true
        });

        let number = 0;
        if(requirements.airR) number++;
        if(requirements.earthR) number++;
        if(requirements.fireR) number++;
        if(requirements.waterR) number++;

        if(number >= 3) return { hasWon: true, bypassCreeper: false }
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG08 = (keepers: CardSchema[]) => {
        const requirements = { airR: false, archmage: false, dukeH: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KR03") requirements.airR = true;
            if(keeper.id === "KL03") requirements.dukeH = true
            if(keeper.id === "KL07") requirements.archmage = true
        });

        if(requirements.airR && requirements.archmage && requirements.dukeH) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG09 = (keepers: CardSchema[]) => {
        const requirements = { drunkenDwarf: false, wizardBeer: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL06") requirements.drunkenDwarf = true;
            if(keeper.id === "CR03") requirements.wizardBeer = true
        });

        if(requirements.drunkenDwarf && requirements.wizardBeer) return { hasWon: true, bypassCreeper: true };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG10 = (keepers: CardSchema[]) => {
        const requirements = { archmage: false, wizardBeer: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL07") requirements.archmage = true;
            if(keeper.id === "CR03") requirements.wizardBeer = true
        });
        
        if(requirements.archmage && requirements.wizardBeer) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG11 = (keepers: CardSchema[]) => {
        const requirements = { drunkenDwarf: false, cake: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL06") requirements.drunkenDwarf = true;
            if(keeper.id === "K01") requirements.cake = true
        }); 

        if(requirements.cake && requirements.drunkenDwarf) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG12 = (keepers: CardSchema[]) => {
        const requirements = { natureR: false, fireR: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KR07") requirements.natureR = true;
            if(keeper.id === "KR06") requirements.fireR = true
        }); 

        if(requirements.fireR && requirements.natureR) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG13 = (keepers: CardSchema[]) => {
        let requirements = 0;
        /**based on number of creepers 3*/
        keepers.forEach((keeper) => {
            if(keeper.type === "CREEPER") requirements++;
        }); 

        if(requirements >= 3) return { hasWon: true, bypassCreeper: true };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG14 = (keepers: CardSchema[]) => {
        const requirements = { kingRoald: false, poison: false }

        keepers.forEach((keeper) => {
            if(keeper.id === "KL08") requirements.kingRoald = true;
            if(keeper.id === "CR02") requirements.poison = true
        });

        if(requirements.kingRoald && requirements.poison) return { hasWon: true, bypassCreeper: true };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG15 = (keepers: CardSchema[]) => {
        const requirements = { ava: false, ghostSpeak: false, avaDevice: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL09") requirements.ava = true;
            if(keeper.id === "KE05") requirements.avaDevice = true
            if(keeper.id === "KE01") requirements.ghostSpeak = true
        });

        if(requirements.ava && requirements.avaDevice && requirements.ghostSpeak) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG16 = (keepers: CardSchema[]) => {
        const requirements = { runeXbow: false, avaDevice: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KE04") requirements.runeXbow = true;
            if(keeper.id === "KE05") requirements.avaDevice = true
        });

        if(requirements.avaDevice && requirements.runeXbow) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG17 = (keepers: CardSchema[]) => {
        const requirements = { ernest: false, ava: false, ghost: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL01") requirements.ernest = true;
            if(keeper.id === "KL09") requirements.ava = true
            if(keeper.id === "KL02") requirements.ghost = true
        });

        if(requirements.ava && requirements.ernest && requirements.ghost) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG18 = (keepers: CardSchema[]) => {
        const requirements = { runeXbow: false, vampyreJuvinate: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KE04") requirements.runeXbow = true;
            if(keeper.id === "KL10") requirements.vampyreJuvinate = true
        });

        if(requirements.runeXbow && requirements.vampyreJuvinate) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG19 = (keepers: CardSchema[]) => {
        const requirements = { lawR: false, dramanStaff: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KE06") requirements.dramanStaff = true
            if(keeper.id === "KR08") requirements.lawR = true
        });

        if(requirements.lawR && requirements.dramanStaff) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG20 = (keepers: CardSchema[], location: string) => {
        const requirements = { entrana: false, equipmentOrRune: 0 };
        /**number type for equipment and runes 4*/
        keepers.forEach((keeper) => {
            if(keeper.subtype === "RUNE" || keeper.subtype === "EQUIPMENT") {
                requirements.equipmentOrRune += 1;
            }
        });
        if(location === "ENTRANA") requirements.entrana = true;

        if(requirements.entrana && requirements.equipmentOrRune >= 4) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG21 = (keepers: CardSchema[]) => {
        const requirements = { kingRoald: false, dukeH: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL03") requirements.dukeH = true
            if(keeper.id === "KL08") requirements.kingRoald = true
        });

        if(requirements.dukeH && requirements.kingRoald) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG22 = (keepers: CardSchema[]) => {
        const requirements = { mindR: false, goblin: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KR01") requirements.mindR = true
            if(keeper.id === "KL11") requirements.goblin = true
        });

        if(requirements.goblin && requirements.mindR) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG23 = (keepers: CardSchema[]) => {
        const requirements = { cosmicR: false, dramanStaff: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KE06") requirements.dramanStaff = true
            if(keeper.id === "KR09") requirements.cosmicR = true
        });

        if(requirements.cosmicR && requirements.dramanStaff) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG24 = (keepers: CardSchema[]) => {
        const requirements = { mindR: false, chaosR: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KR01") requirements.mindR = true
            if(keeper.id === "KR02") requirements.chaosR = true
        });

        if(requirements.chaosR && requirements.mindR) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG25 = (keepers: CardSchema[]) => {
        const requirements = { lawR: false, natureR: false, cosmicR: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KE07") requirements.natureR = true
            if(keeper.id === "KR08") requirements.lawR = true
            if(keeper.id === "KR09") requirements.cosmicR = true
        });

        if(requirements.cosmicR && requirements.lawR && requirements.natureR) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG26 = (keepers: CardSchema[]) => {
        const requirements = { waterR: false, earthR: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KR05") requirements.earthR = true
            if(keeper.id === "KR04") requirements.waterR = true
        });

        if(requirements.earthR && requirements.waterR) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG27 = (keepers: CardSchema[], location: string) => {
        const requirements = { wilderness: false, imp: false, chaosR: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL12") requirements.imp = true
            if(keeper.id === "KR02") requirements.chaosR = true
        });

        if(location === "WILDERNESS") requirements.wilderness = true;

        if(requirements.chaosR && requirements.wilderness && requirements.imp) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG28 = (keepers: CardSchema[]) => {
        const requirements = { imp: false, goblin: false, ernest: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL12") requirements.imp = true
            if(keeper.id === "KL11") requirements.goblin = true
            if(keeper.id === "KL01") requirements.ernest = true
        });

        if(requirements.ernest && requirements.goblin && requirements.imp) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG29 = (keepers: CardSchema[], location: string) => {
        const requirements = { morytania: false, ghost: false, vampyreJuvinate: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL02") requirements.ghost = true
            if(keeper.id === "KL10") requirements.vampyreJuvinate = true
        });

        if(location === "MORYTANIA") requirements.morytania = true;
        console.log(requirements);
        if(requirements.ghost && requirements.morytania && requirements.vampyreJuvinate) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG30 = (keepers: CardSchema[], location: string) => {
        const requirements = { morytania: false, ghost: 0, }
        /**4 ghosts */
        keepers.forEach((keeper) => {
            if(keeper.id === "KL11") requirements.ghost += 1;
        });

        if(location === "MORYTANIA") requirements.morytania = true;

        if(requirements.ghost >= 4 && requirements.morytania) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG31 = (keepers: CardSchema[], location: string) => {
        const requirements = { abyss: false, chaosR: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KR02") requirements.chaosR = true;
        });

        if(location === "ABYSS") requirements.abyss = true;

        if(requirements.abyss && requirements.chaosR) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG32 = (keepers: CardSchema[]) => {
        const requirements = { vampyreJuvinate: false, airStaff: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KL10") requirements.vampyreJuvinate = true;
            if(keeper.id === "KE03") requirements.airStaff = true;
        });

        if(requirements.airStaff && requirements.vampyreJuvinate) return { hasWon: true, bypassCreeper: false }
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG33 = (keepers: CardSchema[]) => {
        const requirements = { runeScimitar: false, runeXbow: false, airStaff: false };

        keepers.forEach((keeper) => {
            if(keeper.id === "KE07") requirements.runeScimitar = true;
            if(keeper.id === "KE04") requirements.runeXbow = true;
            if(keeper.id === "KE03") requirements.airStaff = true;
        });

        if(requirements.airStaff && requirements.runeScimitar && requirements.runeXbow) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG34 = (keepers: CardSchema[]) => {
        const requirements = { runeScimitar: false, antfireShield: false, cake: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "KE07") requirements.runeScimitar = true;
            if(keeper.id === "KE02") requirements.antfireShield = true;
            if(keeper.id === "K01") requirements.cake = true;
        });

        if(requirements.antfireShield && requirements.cake && requirements.runeScimitar) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG35 = (keepers: CardSchema[]) => {
        const requirements = { chaosR: false, drunkenDwarf: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "KR02") requirements.chaosR = true;
            if(keeper.id === "KL06") requirements.drunkenDwarf = true;
        });

        if(requirements.chaosR && requirements.drunkenDwarf) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG36 = (keepers: CardSchema[]) => {
        const requirements = { antiPoison: false, poison: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "CR02") requirements.poison = true;
            if(keeper.id === "K02") requirements.antiPoison = true;
        });

        if(requirements.antiPoison && requirements.poison) return { hasWon: true, bypassCreeper: true };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG37 = (keepers: CardSchema[], location: string) => {
        const requirements = { antiPoison: false, wilderness: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "K02") requirements.antiPoison = true;
        });

        if(location === "WILDERNESS") requirements.wilderness = true;

        if(requirements.antiPoison && requirements.wilderness) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG38 = (keepers: CardSchema[]) => {
        const requirements = { arisMaye: false, reldo: false, kingRoald: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "KL14") requirements.reldo = true;
            if(keeper.id === "KL13") requirements.arisMaye = true;
            if(keeper.id === "KL08") requirements.kingRoald = true;
        });

        if(requirements.kingRoald && requirements.arisMaye && requirements.reldo) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkG39 = (keepers: CardSchema[]) => {
        const requirements = { arisMaye: false, cook: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "KL05") requirements.cook = true;
            if(keeper.id === "KL13") requirements.arisMaye = true;
        });

        if(requirements.cook && requirements.arisMaye) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkGM01 = (keepers: CardSchema[]) => {
        const requirements = { verac: false, torag: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "KLM02") requirements.verac = true;
            if(keeper.id === "KLM01") requirements.torag = true;
        });

        if(requirements.torag && requirements.verac) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkGM02 = (keepers: CardSchema[]) => {
        const requirements = { guthan: false, dharok: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "KLM03") requirements.guthan = true;
            if(keeper.id === "KLM04") requirements.dharok = true;
        });

        if(requirements.guthan && requirements.dharok) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const checkGM03 = (keepers: CardSchema[]) => {
        const requirements = { karil: false, ahrim: false };
        
        keepers.forEach((keeper) => {
            if(keeper.id === "KLM05") requirements.karil = true;
            if(keeper.id === "KLM06") requirements.ahrim = true;
        });

        if(requirements.karil && requirements.ahrim) return { hasWon: true, bypassCreeper: false };
        else return { hasWon: false, bypassCreeper: false };
    }

    const compareKeepersToGoal = (
        keepers: CardSchema[], 
        goal: CardSchema,
        location: string
    ): {
        hasWon: boolean,
        bypassCreeper: boolean,
    } => {
        if(!goal) return { hasWon: false, bypassCreeper: false };
        switch(goal.id) {
            case "G01":
                return checkG01(keepers);
            case "G02":
                return checkG02(keepers);
            case "G03":
                return checkG03(keepers);
            case "G04":
                return checkG04(keepers, location);
            case "G05":
                return checkG05(keepers);
            case "G06":
                return checkG06(keepers);
            case "G07":
                return checkG07(keepers);
            case "G08":
                return checkG08(keepers);
            case "G09":
                return checkG09(keepers);
            case "G10":
                return checkG10(keepers);
            case "G11":
                return checkG11(keepers);
            case "G12":
                return checkG12(keepers);
            case "G13":
                return checkG13(keepers);
            case "G14":
                return checkG14(keepers);
            case "G15":
                return checkG15(keepers);
            case "G16":
                return checkG16(keepers);
            case "G17":
                return checkG17(keepers);
            case "G18":
                return checkG18(keepers);
            case "G19":
                return checkG19(keepers);
            case "G20":
                return checkG20(keepers, location);
            case "G21":
                return checkG21(keepers);
            case "G22":
                return checkG22(keepers);
            case "G23":
                return checkG23(keepers);
            case "G24":
                return checkG24(keepers);
            case "G25":
                return checkG25(keepers);
            case "G26":
                return checkG26(keepers);
            case "G27":
                return checkG27(keepers, location);
            case "G28":
                return checkG28(keepers);
            case "G29":
                return checkG29(keepers, location);
            case "G30":
                return checkG30(keepers, location);
            case "G31":
                return checkG31(keepers, location);
            case "G32":
                return checkG32(keepers);
            case "G33":
                return checkG33(keepers);
            case "G34":
                return checkG34(keepers);
            case "G35":
                return checkG35(keepers);
            case "G36":
                return checkG36(keepers);
            case "G37":
                return checkG37(keepers, location);
            case "G38":
                return checkG38(keepers);
            case "G39":
                return checkG39(keepers);
            case "GM01":
                return checkGM01(keepers);
            case "GM02":
                return checkGM02(keepers);
            case "GM03":
                return checkGM03(keepers);
        }

        return { hasWon: false, bypassCreeper: false };
    }
    
    return {
        compareKeepersToGoal
    }
})();