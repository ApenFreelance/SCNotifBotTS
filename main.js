const axios = require("axios")

async function getBuild(className, specialization, mode="3v3") {
    return await axios.get(`https://murlok.io/api/guides/${className}/${specialization}/${mode}`).then(e=> e.data)
}

const data = require("./devData.json")


function buildParser (data) {
    const uniqueBuilds = {
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
        },
        gems: {},
        embelleshment: {}
    }
    data.Characters.forEach(character => {
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
    return Object.entries(obj)
        .sort((a, b) => b[1]- a[1])
        .slice(0, n)
}

function getAnyEqualOrAboveN(obj, n) {
    delete obj.undefined
    return Object.entries(obj)
        .sort((a, b) => b[1]- a[1])
        .filter(x => x[1] >= n)
}

function reduceUniqueBuilds(obj) {
    const race = getNLargestPairs(obj.race, 1)
    const TalentsCodes = getAnyEqualOrAboveN(obj.TalentsCodes, 5)
    const pvpTalents= getAnyEqualOrAboveN(obj.pvpTalents, 10)
    const gear = loopGear(obj.gear, 3, getNLargestPairs)
    const gems = getNLargestPairs(obj.gems, 3)
    const embelleshment = getNLargestPairs(obj.embelleshment, 3)

    const newObj = {
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


const classes =require("./classes.json")

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
    console.log(rows)
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


const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

const DEVspreadsheet = process.env.DEVsheet;
const prod = process.env.PRODsheet;

const spreadsheetId = "1_4TIqntQgcvLctYErnFg5b6Hr7a9YoLV9cNL_d6ibhA";

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
async function authorize() {
    let authClient = new google.auth.GoogleAuth({
        keyFile: "credentials.json", //the key file
        //url to spreadsheets API
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    if (authClient == null) {
        throw Error("authentication failed");
    }
    return authClient;
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

function createSheetRows(sheetname, start, data) {
    const rows = []
    Object.values(data).forEach(stat => {
        rows.push(
            { range: `${sheetname}!A${start + 1}`, value: stat.text}
        )
        rows.push(
            { range: `${sheetname}!B${start + 1}`, value: stat.number}
        )
        start++
    })
    return rows
    
    
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

console.log(race("sheet1", 1, {
    versatility: {text:"This", number:20},
    mastery: {text:"That", number:2}

}))



