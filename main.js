const axios = require("axios")

async function getBuild(className, specialization, mode="3v3") {
    return await axios.get(`https://murlok.io/api/guides/${className}/${specialization}/${mode}`).then(e=> e.data)
}

const data = require("./devData.json")


function buildParser (data) {
    const uniqueBuilds = {}
    data.Characters.forEach(character => {
        uniqueBuilds[character.TalentsCode] = (uniqueBuilds[character.TalentsCode] + 1) || 1
    })
    return uniqueBuilds
}

function getMaxObject(obj) {
    return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)
}

async function run() {
    buildParser(await getBuild("paladin", "retribution"))
}

run()