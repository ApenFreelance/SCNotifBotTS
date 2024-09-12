import ReviewTimerOverwrite from '../../models/ReviewTimerOverwrite'
import { cLog } from './cLog'

async function getTimeBetweenRoles(server: { serverName: string; }) {
    const roles = await ReviewTimerOverwrite.findAll({
        where: {
            isRole:true,
            server:server.serverName
        }
    })
    return roles
}
async function getOrCreateTimeBetweenEntry(userId, username, days, uses, server, isRole) {
    const [entry, created] = await ReviewTimerOverwrite.findOrCreate({
        where: {
            userId,
            server: server.serverName,
            isRole
        },
        defaults: {
            username,
            timeBetween: days,
            uses,
            isRole,
            server:server.serverName
        } })
    if (created) 
        return formatGetOrCreateTimeBetweenReply(server, isRole, username, userId, entry.timeBetween, entry.uses)
    
    const entrySeconds = entry.timeBetween
    const entryUses = entry.uses
    const updated = await entry.update({
        userId,
        server: server.serverName,
        isRole,
        username,
        timeBetween: days,
        uses,
    })

    return formatGetOrCreateTimeBetweenReply(server, isRole, username, userId, updated.timeBetween, updated.uses, entrySeconds, entryUses)
}

function formatGetOrCreateTimeBetweenReply(server, isRole, username, userId, primarySeconds, primaryUses, updatedSeconds = null, updatedUses = null) {
    let name
    let fullText = ''
    if (isRole) 
        name = `<@&${userId}>`
    else 
        name = `<@${userId}>`
    

    if (updatedSeconds !== null) {
        fullText += `${name} existed before with ${parseInt(updatedSeconds) / 86400} days with ${updatedUses} use(s) left\n`
        cLog([`${username} existed before with ${parseInt(updatedSeconds) / 86400} days with ${updatedUses} use(s) left`], { guild:server, subProcess:'ReviewTimeOverwrite' })

    }
    fullText += `${name} now set to ${parseInt(primarySeconds) / 86400} days for ${primaryUses} use(s)\n`
    cLog([`${username} now set to ${parseInt(primarySeconds) / 86400} days for ${primaryUses} use(s)`], { guild:server, subProcess:'ReviewTimeOverwrite' })
    return fullText
    
}


async function getTimeBetweenByUserId(userId, server) {
    return await ReviewTimerOverwrite.findOne({ where: {
        userId,
        server: server.serverName
    } })
}

async function createNewTimerOverwrite(username, userId, timeBetween, uses, isRole) {
    await ReviewTimerOverwrite.create({
        username,
        userId,
        timeBetween,
        uses,
        isRole
    })
}
async function getTimeBetweenUserApplicableRoles(userRoles, server) {
    const userApplicableRoles = []
    for (const entry of await getTimeBetweenRoles(server)) {
        if (userRoles.has(entry.userId)) 
            userApplicableRoles.push(entry)
        
    }
    if (userApplicableRoles.length === 0)  
        return null
     
    return userApplicableRoles
}


async function getOverwrites(userId, userRoles, server) {
    const userTimeBetween = await getTimeBetweenByUserId(userId, server)
    const timeBetweenRoles = await getTimeBetweenUserApplicableRoles(userRoles, server)
    return { userTimeBetween, timeBetweenRoles }
}
async function getShortestOverwrite(userTimeBetween, timeBetweenRoles, guildId = null) {
    let times = []
    if (userTimeBetween !== null) 
        times.push(userTimeBetween)
    
    if (timeBetweenRoles !== null) 
        times = times.concat(timeBetweenRoles)
    
    const smallest = times.reduce(function(prev, curr) {
        return parseInt(prev.timeBetween) < parseInt(curr.timeBetween) ? prev : curr
    })
    cLog(['Found shortest entery as: ' + smallest.username], { guild:guildId, subProcess:'TimeBetween' })
    return smallest
}

async function reduceTimeBetweenUses(userId, guildId) {
    const object = await ReviewTimerOverwrite.findOne({
        where: {
            userId
        } })
    object.update({
        uses: (typeof object.uses === 'number' ?  object.uses - 1 : 'unlimited' ) // TODO: MAKE SURE THIS CANT BE ABUSED
    })
    if (object.uses === 0) {
        object.destroy()
        cLog([`No uses left for ${object.username}.     - Deleted `], { guild:guildId, subProcess:'TimeBetween' })
        return
    }
    cLog([`Uses left for ${object.username}: ` + object.uses], { guild:guildId, subProcess:'TimeBetween' })
}
export { getTimeBetweenByUserId, getTimeBetweenRoles, createNewTimerOverwrite, getTimeBetweenUserApplicableRoles, getOverwrites, getShortestOverwrite, reduceTimeBetweenUses, getOrCreateTimeBetweenEntry }
