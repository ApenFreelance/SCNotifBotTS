import axios from 'axios' 
//import classes from '../../config/classes.json' 
//import { google } from 'googleapis' 
//import { GoogleAuth } from 'google-auth-library'


interface Entry {
    [key: string]: number
}

interface UniqueBuilds { 
    buildCount: number; 
    statPrio: Entry; 
    race: Entry; 
    TalentsCodes: Entry; 
    pvpTalents: Entry; 
    gear: Record<string, ShortGear>; 
    gems: Entry; 
    embelleshment: Entry; 
}
interface ShortGear { // Probably should change name of this but thats the easiest right now
    name: Entry
    enchantments: Entry
}
interface BuildData {
    ClassSlug: string;
    Specialization: string;
    Activity: string;
    Season: string;
    Characters: WoWCharacter[];
    Stats: unknown;
}

interface ClassTalent {
    ID: number;
    Slug: string;
    UpdatedAt: string;
    CurrentRank: number;
}
interface PvPTalent {
    ID: number;
    Slug: string;
    UpdatedAt: string;
    CurrentRank: number;
    Slot:number;
}
interface Equipment {
    Items: Item[];
    Sets: ItemSet[];
}

interface Item {
    ItemID: number;
    Name: string;
    Slot: string;
    ILevel: number;
    RequiredLevel: number;
    Class: string;
    Quality: string;
    Subclass: string;
    Weapon: unknown;
    Stats: ItemStat[];
    Enchantments: Enchantment[];
    Spells: Spell[];
    Gems: Gem[];
    Quantity: number;
    Binding: string;
    Set: ItemSet[];
}
interface ItemSet {
    ID:number;
    Name:string;
    Effects: ItemEffect[]
}

interface ItemEffect {
    Description:string;
    RequiredCount:number;
    IsActive: boolean;
}
interface Spell {
    ID: number;
    UpdatedAt: string;
    Name:string;
    Description: string;
}
interface ItemStat {
    Value: number;
    Color:string;
    Name: string;
}
interface Gem {
    ItemID: number;
    Name: string;
    Type: string;
    Description: string;
}

interface Enchantment {
    ID: number;
    ItemID: number;
    Name: string;
    Slot: string;
    Description: string;
}
interface SpecializationTalent {
    ID: number;
    Slug: string;
    UpdatedAt: string;
    CurrentRank: number;
}

interface WoWCharacter {
    ID: number;
    Slug: string;
    ClassSlug: string;
    Specialization: string;
    RealmSlug: string;
    Region: string;
    Type: string;
    UpdatedAt: string;
    LastLogin: string;
    GenderSlug: string;
    RaceSlug: string;
    FactionSlug: string;
    GuildSlug: string;
    RatingSoloShuffle: number;
    Rating2v2: number;
    Rating3v3: number;
    RatingRBG: number;
    Level: number;
    AverageItemLevel: number;
    EquippedItemLevel: number;
    AvatarURL: string;
    ProfileURL: string;
    ClassTalents: ClassTalent[];
    SpecializationTalents: SpecializationTalent[];
    PvPTalents: PvPTalent[];
    Equipment: Equipment;
    Haste: number;
    HasteBonus: number;
    HasteValue: number;
    Crit: number;
    CritBonus: number;
    CritValue: number;
    Mastery: number;
    MasteryBonus: number;
    MasteryValue: number;
    Versatility: number;
    VersatilityBonus: number;
    VersatilityATK: number;
    VersatilityDEF: number;
    Speed: number;
    SpeedBonus: number;
    SpeedValue: number;
    TalentsCode: string;
}
  

export class BuildHandler {
    private spreadsheetId: string
    constructor() {
        this.spreadsheetId = process.env.buildSheet!
    }
    
    private async getBuild(className: string, specialization: string, mode: string = 'solo'): Promise<BuildData> {
        return await axios.get(`https://murlok.io/api/guides/${className.replace(' ', '-')}/${specialization.replace(' ', '-')}/${mode}`).then(e => e.data)
    }
    
    private buildParser(data: BuildData): UniqueBuilds {
        const uniqueBuilds: UniqueBuilds = {
            buildCount: 0,
            statPrio: {
                Haste: 0,
                Mastery: 0,
                Versatility: 0,
                Crit: 0
            },
            race: {},
            TalentsCodes: {},
            pvpTalents: {},
            gear: {
                head: { name: {}, enchantments: {} },
                neck: { name: {}, enchantments: {} },
                shoulders: { name: {}, enchantments: {} },
                back: { name: {}, enchantments: {} },
                chest: { name: {}, enchantments: {} },
                wrist: { name: {}, enchantments: {} },
                hands: { name: {}, enchantments: {} },
                waist: { name: {}, enchantments: {} },
                legs: { name: {}, enchantments: {} },
                feet: { name: {}, enchantments: {} },
                rings: { name: {}, enchantments: {} },
                trinket: { name: {}, enchantments: {} },
                mainHand: { name: {}, enchantments: {} },
                offHand: { name: {}, enchantments: {} }
            },
            gems: {},
            embelleshment: {}
        }
    
        data.Characters.forEach((character: WoWCharacter) => {
            if (uniqueBuilds.buildCount >= 25) return
            uniqueBuilds.buildCount++
    
            uniqueBuilds.statPrio.Haste += character.Haste || 0
            uniqueBuilds.statPrio.Mastery += character.Mastery || 0
            uniqueBuilds.statPrio.Versatility += character.Versatility || 0
            uniqueBuilds.statPrio.Crit += character.Crit || 0
    
            uniqueBuilds.race[character.RaceSlug] = (uniqueBuilds.race[character.RaceSlug]) + 1 || 1
            uniqueBuilds.TalentsCodes[character.TalentsCode] = (uniqueBuilds.TalentsCodes[character.TalentsCode] + 1) || 1
    
            character.Equipment.Items.forEach((item: Item) => {
                let altSlot = null
                if (!uniqueBuilds.gear[item.Slot]) {
                    switch (item.Slot) {
                        case 'trinket-1':
                        case 'trinket-2':
                            altSlot = 'trinket'
                            break
                        case 'ring-1':
                        case 'ring-2':
                            altSlot = 'rings'
                            break
                        case 'main-hand':
                            altSlot = 'mainHand'
                            break
                        case 'off-hand':
                            altSlot = 'offHand'
                            break
                        case 'undefined':
                            return
                        default:
                            uniqueBuilds.gear[item.Slot] = { name: {}, enchantments: {} }
                    }
                }
                uniqueBuilds.gear[altSlot || item.Slot].name[item.Name] = uniqueBuilds.gear[altSlot || item.Slot].name[item.Name] + 1 || 1
                if (item.Enchantments) {
                    if (item.Enchantments[0].Name) 
                        uniqueBuilds.gear[altSlot || item.Slot].enchantments[item.Enchantments[0].Name] = uniqueBuilds.gear[altSlot || item.Slot].enchantments[item.Enchantments[0].Name] + 1 || 1
                    else 
                        uniqueBuilds.gear[altSlot || item.Slot].enchantments[item.Enchantments[0].Description.replace('Enchanted: ', '')] = uniqueBuilds.gear[altSlot || item.Slot].enchantments[item.Enchantments[0].Description.replace('Enchanted: ', '')] + 1 || 1
                    
                }
                if (item.Gems) {
                    item.Gems.forEach((gem: Gem) => {
                        uniqueBuilds.gems[gem.Name] = uniqueBuilds.gems[gem.Name] + 1 || 1
                    })
                }
                if (item.Spells) {
                    item.Spells.forEach((spell: Spell) => {
                        switch (item.Slot) {
                            case 'trinket-1':
                            case 'trinket-2':
                                return
                            default:
                                uniqueBuilds.embelleshment[spell.Name] = uniqueBuilds.embelleshment[spell.Name] + 1 || 1
                                break
                        }
                    })
                }
            })
    
            character.PvPTalents.forEach((talent: PvPTalent) => {
                uniqueBuilds.pvpTalents[talent.Slug] = (uniqueBuilds.pvpTalents[talent.Slug]) + 1 || 1
            })
        })
    
        return uniqueBuilds
    }
    
    private async run(className: string, spec: string) {
        let raw
        try {
            raw = await this.getBuild(className.toLowerCase(), spec.toLowerCase())
        } catch {
            return null
        }
        const obj = this.buildParser(raw)
        return this.reduceUniqueBuilds(obj)
    }
    
    private getNLargestPairs(obj: Entry, n: number) {
        delete obj.undefined
        const sortedFiltered: [string, number | ' '][] = Object.entries(obj)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
        while (sortedFiltered.length < n) sortedFiltered.push([' ', ' ']) // Add empty to clear out old row content
        return sortedFiltered
    }
    
    private reduceUniqueBuilds(obj: UniqueBuilds) {
        const statsPrio = Object.entries(obj.statPrio).map(([key, value]) => {
            return [key, Math.round(value / obj.buildCount)]
        })
        const race = this.getNLargestPairs(obj.race, 4)
        const TalentsCodes = this.getNLargestPairs(obj.TalentsCodes, 5)
        const pvpTalents = this.getNLargestPairs(obj.pvpTalents, 6)
        const gear = this.loopGear(obj.gear, 3, this.getNLargestPairs.bind(this))
        const gems = this.getNLargestPairs(obj.gems, 5)
        const embelleshment = this.getNLargestPairs(obj.embelleshment, 5)
    
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
    
    private loopGear(obj, n: number, getNLargestPairs: (obj: Entry, n: number) => [string, number][]) {
        delete obj.undefined
        const newObj = {}
        Object.keys(obj).forEach(slot => {
            const name = getNLargestPairs(obj[slot].name, n)
            const enchantments = getNLargestPairs(obj[slot].enchantments, n)
            newObj[slot] = { name, enchantments }
        })
        return newObj
    }
    /* 
    private async updateGoogleSheet(data: any) {
        const auth = new GoogleAuth({
            keyFile: 'credentials.json', // the key file
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
        })
        const service = google.sheets({ version: 'v4', auth })
    
        const request = {
            spreadsheetId: this.spreadsheetId,
            resource: {
                valueInputOption: 'USER_ENTERED',
                data,
            },
            auth,
        }
    
        try {
            const response = (
                await service.spreadsheets.values.batchUpdate(request)
            ).data
        } catch (err) {
            console.error(err)
        }
    }
    
    private createSheetRows(sheetname: string, start: number, data: any, column1: string = 'A', column2: string = 'B') {
        const rows = []
        Object.values(data).forEach(stat => {
            rows.push(
                { range: `${sheetname}!${column1}${start + 1}`, value: stat[0].replace('+', '') || ' ' } // Text
            )
            rows.push(
                { range: `${sheetname}!${column2}${start + 1}`, value: stat[1] || ' ' } // Number
            )
            start++
        })
        return rows
    }
    
    private collectedRows(sheetname: string, data: any) {
        return [
            ...this.createSheetRows(sheetname, 1, data.statsPrio),
            ...this.createSheetRows(sheetname, 6, data.race),
            ...this.createSheetRows(sheetname, 11, data.TalentsCodes),
            ...this.createSheetRows(sheetname, 17, data.pvpTalents),
            ...this.createSheetRows(sheetname, 24, data.gear.head.name),
            ...this.createSheetRows(sheetname, 24, data.gear.head.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 28, data.gear.neck.name),
            ...this.createSheetRows(sheetname, 28, data.gear.neck.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 32, data.gear.shoulders.name),
            ...this.createSheetRows(sheetname, 32, data.gear.shoulders.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 36, data.gear.back.name),
            ...this.createSheetRows(sheetname, 36, data.gear.back.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 40, data.gear.chest.name),
            ...this.createSheetRows(sheetname, 40, data.gear.chest.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 44, data.gear.wrist.name),
            ...this.createSheetRows(sheetname, 44, data.gear.wrist.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 48, data.gear.hands.name),
            ...this.createSheetRows(sheetname, 48, data.gear.hands.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 52, data.gear.waist.name),
            ...this.createSheetRows(sheetname, 52, data.gear.waist.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 56, data.gear.legs.name),
            ...this.createSheetRows(sheetname, 56, data.gear.legs.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 60, data.gear.feet.name),
            ...this.createSheetRows(sheetname, 60, data.gear.feet.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 64, data.gear.rings.name),
            ...this.createSheetRows(sheetname, 64, data.gear.rings.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 68, data.gear.trinket.name),
            ...this.createSheetRows(sheetname, 68, data.gear.trinket.enchantments, 'C', 'D'),
            ...this.createSheetRows(sheetname, 72, data.gear.mainHand.name),
        // NOT DONE
        ] 
    } */

}

/* async function mainBuildHandler() {
    const rows = []
    const failed = []
    for (const [className, specArray] of Object.entries(classes)) {
        for (const spec of specArray) {
            const obj = await run(className, spec)
            
            if (!obj) { // Verifies if CLASS and SPEC passed. Not specific row
                console.log('Failed to find class or spec content')
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
        console.log('Could not update sheet : ', err )
        throw err
    } finally {
        console.log('Failed to find class or spec content for ' + failed.length + ' classes or specs')
        console.log(failed)
    }

}
 */
