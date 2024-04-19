const axios = require("axios")

async function getBuild(className, specialization, mode="3v3") {
    return await axios.get(`https://murlok.io/api/guides/${className}/${specialization}/${mode}`).then(e=> e.data)
}

const data = require("./devData.json")


function buildParser (data) {
    const gearSlotContent = {
        name: {},
        enchantment: {}
    }
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
    console.log(uniqueBuilds)
    return uniqueBuilds
}

function getMaxObject(obj) {
    return Object.values(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)
}

async function run() {
    buildParser(await getBuild("paladin", "retribution"))
}

//run()

function reduceUniqueBuilds(obj) {

}

function getNLargestPairs(obj, n) {
    return Object.entries(obj)
        .sort((a, b) => b[1]- a[1])
        .slice(0, n)
}


console.log(
    getNLargestPairs({
        a:1,
        b:2,
        c:3,
        d:222,
        e:2.3,
        f:3

    }, 2)
)