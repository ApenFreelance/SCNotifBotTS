import colors from 'colors'

interface CLogOptions {
    guild?: string | { id?: string; serverId?: string };
    oneLine?: boolean;
    spacings?: number;
    subProcess?: string | null;
}

class Logger {
    static colorSubProcess(subProcess: string | null, color: string): string {
        if (subProcess !== null) 
            return `=>[${colors[color](subProcess)}]`
        
        return ''
    }

    static log(args: any[] = [], { guild = 'System', oneLine = true, spacings = 0, subProcess = null }: CLogOptions = {}): void {
        let game: string

        if (guild === 'System') {
            game = colors.yellow('System')
            subProcess = Logger.colorSubProcess(subProcess, 'yellow')
        } else if (typeof guild === 'string') {
            if (guild === '855206452771684382') {
                // Valorant
                game = colors.magenta('VALORANT')
                subProcess = Logger.colorSubProcess(subProcess, 'magenta')
            } else if (guild === '294958471953252353') {
                // WoW
                game = colors.blue('WoW')
                subProcess = Logger.colorSubProcess(subProcess, 'blue')
            } else if (guild === '1024961321768329246') {
                // Dev
                game = colors.yellow('Dev')
                subProcess = Logger.colorSubProcess(subProcess, 'yellow')
            } else {
                // WHO DIS?!
                game = colors.red(guild)
            }
        } else if (typeof guild === 'object' && guild !== null) {
            if (guild.id === '855206452771684382' || guild.serverId === '855206452771684382') {
                // Valorant
                game = colors.magenta('VALORANT')
                subProcess = Logger.colorSubProcess(subProcess, 'magenta')
            } else if (guild.id === '294958471953252353' || guild.serverId === '294958471953252353') {
                // WoW
                game = colors.blue('WoW')
                subProcess = Logger.colorSubProcess(subProcess, 'blue')
            } else if (guild.id === '1024961321768329246' || guild.serverId === '1024961321768329246') {
                // Dev
                game = colors.yellow('Dev')
                subProcess = Logger.colorSubProcess(subProcess, 'yellow')
            } else {
                // WHO DIS?!
                game = colors.red(guild.id || 'Unknown')
            }
        } else {
            // Default case for unexpected types
            game = colors.gray('Unknown')
            subProcess = Logger.colorSubProcess(subProcess, 'gray')
        }

        if (oneLine === true) 
            console.log(`[ ${game} ]${subProcess} ${args.join(' ')} ${'\n'.repeat(spacings)}`)
        else {
            for (let i = 0; i < args.length; i++) 
                console.log(`[ ${game} ]${subProcess} ${args[i]}${'\n'.repeat(spacings)}`)
            
        }
    }
}

export { Logger }
