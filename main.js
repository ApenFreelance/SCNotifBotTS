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
            head:{},
            neck:{},
            shoulders:{},
            back:{},
            chest:{},
            wrist:{},
            hands:{},
            waist:{},
            legs:{},
            feet:{},
            rings:{},
            trinket:{},
            mainHand:{},
        }
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
                        default: uniqueBuilds.gear[item.Slot] = {}
                    }
                }
                uniqueBuilds.gear[altSlot || item.Slot][item.Name] = uniqueBuilds.gear[altSlot || item.Slot][item.Name] +1 || 1
        })

        character.PvPTalents.forEach(talent => {
            uniqueBuilds.pvpTalents[talent.Slug] = (uniqueBuilds.pvpTalents[talent.Slug]) +1 || 1
        })

    })
    console.log(uniqueBuilds)
    return uniqueBuilds
}

function getMaxObject(obj) {
    return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)
}

async function run() {
    buildParser(await getBuild("paladin", "retribution"))
}

run()