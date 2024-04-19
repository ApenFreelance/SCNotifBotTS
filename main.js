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
            feet:{
                name: {},
                enchantments: {}
            },
            legs:{
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

async function run() {
    const raw = await getBuild("paladin", "retribution")
    //console.log(raw)
    const obj = buildParser(raw)
    console.log(reduceUniqueBuilds(obj).gear)
}

run()

function getNLargestPairs(obj, n) {
    delete obj.undefined
    return Object.entries(obj)
        .sort((a, b) => b[1]- a[1])
        .slice(0, n)
}

function reduceUniqueBuilds(obj) {
    const race = getNLargestPairs(obj.race, 1)
    const TalentsCodes = getNLargestPairs(obj.TalentsCodes, 1)
    const pvpTalents= getNLargestPairs(obj.pvpTalents, 3)
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


