const axios = require("axios")
const classes =require("./classes.json")
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

async function getBuild(className, specialization, mode="3v3") {
    return await axios.get(`https://murlok.io/api/guides/${className.replace(" ", "-")}/${specialization.replace(" ", "-")}/${mode}`).then(e=> e.data)
}


function buildParser (data) {
    const uniqueBuilds = {
        buildCount:0,
        statPrio:{
            Haste:0,
            Mastery:0,
            Versatility:0,
            Crit:0
        },
        race:{},
        TalentsCodes:{},
        pvpTalents: {},
        gear: {
            head:{
                name: {},
                enchantments: {}
            },
            neck:{
                name: {},
                enchantments: {}
            },
            shoulders:{
                name: {},
                enchantments: {}
            },
            back:{
                name: {},
                enchantments: {}
            },
            chest:{
                name: {},
                enchantments: {}
            },
            wrist:{
                name: {},
                enchantments: {}
            },
            hands:{
                name: {},
                enchantments: {}
            },
            waist:{
                name: {},
                enchantments: {}
            },
            legs:{
                name: {},
                enchantments: {}
            },
            feet:{
                name: {},
                enchantments: {}
            },
            rings:{
                name: {},
                enchantments: {}
            },
            trinket:{
                name: {},
                enchantments: {}
            },
            mainHand:{
                name: {},
                enchantments: {}
            },
            offHand:{
                name: {},
                enchantments: {}
            }
        },
        gems: {},
        embelleshment: {}
    }
    data.Characters.forEach(character => {
        uniqueBuilds.buildCount++
        // This does not deal with undefined and is hard to read both in code and outside
        const statShorthand = "H"+character.Haste+"C"+character.Crit+"M"+character.Mastery+"V"+character.Versatility
        //uniqueBuilds.statPrio[statShorthand] = (uniqueBuilds.statPrio[statShorthand]) +1 || 1


        // Not enough players have the exact stats so average prob needs to be used
       /*  const stats = {
            Haste: character.Haste || 0,
            Mastery: character.Mastery || 0,
            Versatility: character.Versatility || 0,
            Crit: character.Crit || 0,
        }
        uniqueBuilds.statPrio[JSON.stringify(stats)] = (uniqueBuilds.statPrio[JSON.stringify(stats)]) + 1 || 1 */
        
        uniqueBuilds.statPrio.Haste+= character.Haste || 0
        uniqueBuilds.statPrio.Mastery+= character.Mastery || 0
        uniqueBuilds.statPrio.Versatility+= character.Versatility ||0 
        uniqueBuilds.statPrio.Crit+= character.Crit || 0
        
        
        uniqueBuilds.race[character.RaceSlug] = (uniqueBuilds.race[character.RaceSlug]) +1 || 1
        uniqueBuilds.TalentsCodes[character.TalentsCode] = (uniqueBuilds.TalentsCodes[character.TalentsCode] + 1) || 1
        
        character.Equipment.Items.forEach(item => {
            let altSlot = null
                if(!uniqueBuilds.gear[item.Slot]) {
                    switch(item.Slot) {
                        case "trinket-1":
                        case "trinket-2":
                            altSlot = "trinket"
                            break;
                        case "ring-1":
                        case "ring-2":
                            altSlot = "rings"
                            break;
                        case "main-hand":
                            altSlot = "mainHand"
                            break;
                        case "off-hand":
                            altSlot = "offHand"
                            break;
                        case "undefined":
                            return;
                        default: uniqueBuilds.gear[item.Slot] = {
                            name: {},
                            enchantments: {}
                        }
                    }
                }
                uniqueBuilds.gear[altSlot || item.Slot].name[item.Name] = uniqueBuilds.gear[altSlot || item.Slot].name[item.Name] +1 || 1
                if(item.Enchantments){
                    if(item.Enchantments[0].Name)uniqueBuilds.gear[altSlot || item.Slot].enchantments[item.Enchantments[0].Name] = uniqueBuilds.gear[altSlot || item.Slot].enchantments[item.Enchantments[0].Name] +1 || 1
                    
                    else {
                        uniqueBuilds.gear[altSlot || item.Slot].enchantments[item.Enchantments[0].Description.replace("Enchanted: ", "")] = uniqueBuilds.gear[altSlot || item.Slot].enchantments[item.Enchantments[0].Description.replace("Enchanted: ", "")] +1 || 1
                }}
                if(item.Gems) {
                    item.Gems.forEach(gem => {
                        uniqueBuilds.gems[gem.Name] = uniqueBuilds.gems[gem.Name] +1 || 1
                    })
                }
                if(item.Spells){
                    item.Spells.forEach(spell => {
                        switch(item.Slot) {
                            case "trinket-1":
                            case "trinket-2":
                                return;
                            default: 
                                uniqueBuilds.embelleshment[spell.Name] = uniqueBuilds.embelleshment[spell.Name] +1 || 1
                                break;
                        }
                        
                    })
                }
        })

        character.PvPTalents.forEach(talent => {
            uniqueBuilds.pvpTalents[talent.Slug] = (uniqueBuilds.pvpTalents[talent.Slug]) +1 || 1
        })

    })
    
    return uniqueBuilds
}

function getMaxObject(obj) {
    return Object.values(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)
}

async function run(className, spec) {
    let raw
    try {
        raw = await getBuild(className.toLowerCase(), spec.toLowerCase())
    } catch {
        return null
    }
    //console.log(raw)
    const obj = buildParser(raw)
    //console.log(JSON.stringify(reduceUniqueBuilds(obj)))
    return reduceUniqueBuilds(obj)
}

//run()

function getNLargestPairs(obj, n) {
    delete obj.undefined
    let sortedFiltered = Object.entries(obj)
        .sort((a, b) => b[1]- a[1])
        .slice(0, n)
    while(sortedFiltered.length < n) sortedFiltered.push([" "," "]) // Add empty to clear out old row content
    return sortedFiltered
}

function getAnyEqualOrAboveN(obj, n, max) {
    
    delete obj.undefined
    let sortedFiltered = Object.entries(obj)
        .sort((a, b) => b[1]- a[1])
        .filter(x => x[1] >= n)
        .slice(0, max)

    while(sortedFiltered.length < max) sortedFiltered.push([" ", " "]) // Add empty to clear out old row content
    return sortedFiltered
}

function reduceUniqueBuilds(obj) {
    
    const statsPrio = Object.entries(obj.statPrio).map(([key, value]) => {
        return [key, Math.round(value / obj.buildCount)]
    })
    const race = getNLargestPairs(obj.race, 4)
    const TalentsCodes = getNLargestPairs(obj.TalentsCodes, 5)
    //const TalentsCodes = getAnyEqualOrAboveN(obj.TalentsCodes, 5, 5)
    const pvpTalents= getNLargestPairs(obj.pvpTalents, 6)
    //const pvpTalents= getAnyEqualOrAboveN(obj.pvpTalents, 10, 6)
    const gear = loopGear(obj.gear, 3, getNLargestPairs)
    const gems = getNLargestPairs(obj.gems, 5)
    const embelleshment = getNLargestPairs(obj.embelleshment, 5)

    const newObj = {
            statsPrio,
            race,
            TalentsCodes,
            pvpTalents,
            gear,
            gems,
            embelleshment
    }
    return newObj
}

function loopGear(obj, n, getNLargestPairs) {
    delete obj.undefined
    const newObj = {}
    Object.keys(obj).forEach(slot => {
        const name = getNLargestPairs(obj[slot].name, n)
        const enchantments = getNLargestPairs(obj[slot].enchantments, n)
        newObj[slot] = {name, enchantments}
    })
    return newObj
}




//parseEverySpec()

async function parseEverySpec() {
    let count = 3
    const rows = []
    for (const [className, specArray] of Object.entries(classes)) {
        for (const spec of specArray) {
            count++
            console.log(className, spec)
            const obj = await run(className, spec)
            
            if (!obj) {
                continue
            }
            rows.push(...createRow(className, spec, count, obj))
        }
    }
    await updateGoogleSheet(
        rows.filter(({ value }) => value !== null)
        .map(({ range, value }) => ({ range, values: [[value]] })))
}

const sheetName = "Sheet1"
function createRow(className, spec, rowNumber, buildData) {
    return [
            { range: `${sheetName}!A${rowNumber}`, value: className},
            { range: `${sheetName}!B${rowNumber}`, value: spec},
            { range: `${sheetName}!C${rowNumber}`, value: JSON.stringify(buildData.race)},
            { range: `${sheetName}!D${rowNumber}`, value: JSON.stringify(buildData.TalentsCodes)},
            { range: `${sheetName}!E${rowNumber}`, value: JSON.stringify(buildData.pvpTalents)},
            { range: `${sheetName}!F${rowNumber}`, value: JSON.stringify(buildData.gear.head)},
            { range: `${sheetName}!G${rowNumber}`, value: JSON.stringify(buildData.gear.neck)},
            { range: `${sheetName}!H${rowNumber}`, value: JSON.stringify(buildData.gear.shoulders)},
            { range: `${sheetName}!I${rowNumber}`, value: JSON.stringify(buildData.gear.back)},
            { range: `${sheetName}!J${rowNumber}`, value: JSON.stringify(buildData.gear.chest)},
            { range: `${sheetName}!K${rowNumber}`, value: JSON.stringify(buildData.gear.wrist)},
            { range: `${sheetName}!L${rowNumber}`, value: JSON.stringify(buildData.gear.hands)},
            { range: `${sheetName}!M${rowNumber}`, value: JSON.stringify(buildData.gear.waist)},
            { range: `${sheetName}!N${rowNumber}`, value: JSON.stringify(buildData.gear.legs)},
            { range: `${sheetName}!O${rowNumber}`, value: JSON.stringify(buildData.gear.feet)},
            { range: `${sheetName}!P${rowNumber}`, value: JSON.stringify(buildData.gear.rings)},
            { range: `${sheetName}!Q${rowNumber}`, value: JSON.stringify(buildData.gear.trinket)},
            { range: `${sheetName}!R${rowNumber}`, value: JSON.stringify(buildData.gear.mainHand)},            
            { range: `${sheetName}!S${rowNumber}`, value: JSON.stringify(buildData.gems)},
            { range: `${sheetName}!T${rowNumber}`, value: JSON.stringify(buildData.embelleshment)},
        ]
}





const DEVspreadsheet = process.env.DEVsheet;

const spreadsheetId = DEVspreadsheet;

async function updateGoogleSheet(data) {
    const auth = new GoogleAuth({
        keyFile: "credentials.json", //the key file
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const service = google.sheets({ version: "v4", auth });

    const request = {
        spreadsheetId,
        resource: {
            valueInputOption: "USER_ENTERED",
            data: data,
        },
        auth: auth,
    };

    try {
        const response = (
            await service.spreadsheets.values.batchUpdate(request)
        ).data;
        console.log(response);
    } catch (err) {
        console.error(err);
    }
}






function statPriority(sheetname, start, data) {
    return [
        { range: `${sheetname}!A${start + 1}`, value: data.versatility.text},
        { range: `${sheetname}!B${start + 1}`, value: data.versatility.number},
        { range: `${sheetname}!A${start + 2}`, value: data.mastery.text},
        { range: `${sheetname}!B${start + 2}`, value: data.mastery.number},
        { range: `${sheetname}!A${start + 3}`, value: data.haste.text},
        { range: `${sheetname}!B${start + 3}`, value: data.haste.number},
        { range: `${sheetname}!A${start + 4}`, value: data.criticalStrike.text},
        { range: `${sheetname}!B${start + 4}`, value: data.criticalStrike.number}
    ]
}

function createSheetRows(sheetname, start, data, column1 = "A", column2 = "B") {
    const rows = []
    Object.values(data).forEach(stat => {
        rows.push(
            { range: `${sheetname}!${column1}${start + 1}`, value: stat[0] || " "} // Text
        )
        rows.push(
            { range: `${sheetname}!${column2}${start + 1}`, value: stat[1] || " "} // Number
        )
        start++
    })
    return rows
}

function collectedRows(sheetname, data) {
    return [
        ...createSheetRows(sheetname, 1, data.statsPrio),
        ...createSheetRows(sheetname, 6, data.race),
        ...createSheetRows(sheetname, 11, data.TalentsCodes),
        ...createSheetRows(sheetname, 17, data.pvpTalents),
        ...createSheetRows(sheetname, 24, data.gear.head.name), 
        ...createSheetRows(sheetname, 24, data.gear.head.enchantments, "C", "D"), 
        ...createSheetRows(sheetname, 28, data.gear.neck.name),
        ...createSheetRows(sheetname, 28, data.gear.neck.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 32, data.gear.shoulders.name),
        ...createSheetRows(sheetname, 32, data.gear.shoulders.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 36, data.gear.back.name),
        ...createSheetRows(sheetname, 36, data.gear.back.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 40, data.gear.chest.name),
        ...createSheetRows(sheetname, 40, data.gear.chest.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 44, data.gear.wrist.name),
        ...createSheetRows(sheetname, 44, data.gear.wrist.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 48, data.gear.hands.name),
        ...createSheetRows(sheetname, 48, data.gear.hands.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 52, data.gear.waist.name),
        ...createSheetRows(sheetname, 52, data.gear.waist.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 56, data.gear.legs.name),
        ...createSheetRows(sheetname, 56, data.gear.legs.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 60, data.gear.feet.name),
        ...createSheetRows(sheetname, 60, data.gear.feet.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 64, data.gear.rings.name),
        ...createSheetRows(sheetname, 64, data.gear.rings.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 68, data.gear.trinket.name),
        ...createSheetRows(sheetname, 68, data.gear.trinket.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 72, data.gear.mainHand.name),
        ...createSheetRows(sheetname, 72, data.gear.mainHand.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 76, data.gear.offHand.name),
        ...createSheetRows(sheetname, 76, data.gear.offHand.enchantments, "C", "D"),
        ...createSheetRows(sheetname, 80, data.gems),
        ...createSheetRows(sheetname, 86, data.embelleshment),
    ]
}



async function mainBuildHandler() {
    const rows = []
    const failed = []
    for (const [className, specArray] of Object.entries(classes)) {
        for (const spec of specArray) {
            console.log(className, spec)
            const obj = await run(className, spec)
            
            if (!obj) { // Verifies if CLASS and SPEC passed. Not specific row
                console.log("Failed to find class or spec content")
                failed.push([className, spec])
                continue
            }
            rows.push(...collectedRows(`${spec} ${className}`, obj))
        }
    }
    try {

        await updateGoogleSheet(
            rows.filter(({ value }) => value !== null)
            .map(({ range, value }) => ({ range, values: [[value]] })))   
    } catch (err) {
        console.log("Could not update sheet : ", err )
    }
    finally {
        console.log("Failed to find class or spec content for " + failed.length + " classes or specs")
        console.log(failed)
    }

}

mainBuildHandler()




function createBatchUpdateRequest(){
    const batchUpdateRequest = {
        request: [
            {
                updateCells: {
                    range: {
                        sheetId: "",
                        startRowIndex: 1
                    },
                    rows
                }
            }
        ]
    }
}



module.exports = { mainBuildHandler };
