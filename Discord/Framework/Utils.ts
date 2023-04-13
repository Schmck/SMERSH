export class Utils {

    public static async generatePlayerTable(players, showIpAddress = true) {
        const longestPlayerName = players.reduce((longestName, player) => longestName >= player.Name.length ? longestName : player.Name.length, 0)
        const longestPlayerIp = players.reduce((longestIp, player) => !player.Ip || longestIp >= player.Ip.length ? longestIp : player.Ip.length, 0)
        let playerNames = `\nPlayer`
        playerNames = `${playerNames}${' '.repeat(longestPlayerName + 4 - playerNames.length)}`
        let ipAddressLine = showIpAddress ? `${`\u2500`.repeat(18 - longestPlayerIp)}\u253C` : ''
        let ipAddressHeader = showIpAddress ? `    IP address ${' '.repeat(Math.abs(longestPlayerIp - 12))}\u2502` : ''
        let playerTable = [`${playerNames}\u2502 0x0110000 \u2502${ipAddressHeader} `, `${'\u2500'.repeat(longestPlayerName + 3) }\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C`]
        return [playerTable, players.map((player, index) => {
            let playerName = `${player.Name}${' '.repeat(longestPlayerName + 3 - player.Name.length)}`
            let playerId = player && player.Id ? player.Id.slice(9) : ""
            let ipAddress = ''

            if (playerId) {
                playerId = `${playerId}${' '.repeat(10 - playerId.length)}`
            }

            if (showIpAddress) {
                ipAddress = ` ${player.Ip}${' '.repeat(longestPlayerIp + 2 - player.Ip.length)}\u2502`
            }

            return `${playerName}\u2502 ${playerId}\u2502${ipAddress}`
        })].flat().reverse().reduce((line, table) => `${table}\n${line}`, '')
    }

    public static generateChatLine(line: Record<string, string>) {
        const date = new Date(new Date(line.timestamp).setHours(new Date(line.timestamp).getHours() + 1))
        const timestamp = line.timestamp ? `${date.toLocaleString().slice(0, date.toLocaleString().indexOf(','))} ${date.toTimeString().slice(0, 8)}\u2502` : ''
        const teamMessage = line.team_message ? '(Team)' : ''
        const team = line.team === 'Allies' ? '-' : '+'

        const newLine = `${team} ${timestamp} ${teamMessage} ${line.username}: ${line.message}`
        return newLine
    }

    public static battleDesc(current, resp) {
        if (current.teams.some(team => team.score && (team.attacking || team.rounds_won))) {
            var teams = current.teams.map(team => {
                var nextRound = resp.teams.find(tm => tm.name === team.name)
                var description = []
                var territory = ""
                if (team.rounds_won) {
                    //description[0] = team.name === 'Allies' ? 'The red army' : 'The german wehrmacht'
                    /*if(team.name === 'Allies') {
                        description[0] = 'The red army '
                    }
            
                    if(team.name === 'Axis') {
                        description[0] = 'The german wehrmacht '
                    }*/

                    description[0] = `${team.name} `
                    description[1] = 'has crushed '

                    if (nextRound.territories === team.territories) {
                        description[4] = ' and has taken the territory'
                    }

                    if (nextRound.territories > team.territories) {
                        description[4] = ' and has taken the territory'
                    }

                    if (!team.attacking) {
                        description[4] = ' and keeps the territory'

                        if (current.rules.time_left === -1) {
                            description[1] = 'has withstood '
                        }
                    }

                } else {
                    if (team.name === 'Allies') {
                        description[2] = 'the soviet '
                    }

                    if (team.name === 'Axis') {
                        description[2] = 'the german '
                    }

                    if (team.attacking) {
                        description[2] += 'attack'
                    } else {
                        description[2] += 'defense'
                    }
                    //description[2] = team.name === 'Allies' ? `the soviet ${team.attacking ?  'attack' : 'defense'}` : `the german ${team.attacking ? 'attack' : 'defense'}`

                    // if(nextRound.territories < team.territories) {
                    //     territory = 'and lost a territory'
                    // }
                    // if(nextRound.territories === team.territories) {
                    //     territory = 'and held their territory'
                    // }
                }


                return description
            }) //.flat().filter(f => f)
            let map = current.game.map
            let timeLeft = Utils.secToMin(current.rules.time_left)
            map = map.slice(map.indexOf('|') + 1)
            teams[1][3] = ` at${map}`
            teams[1][6] = ` with ${timeLeft} left`
            console.log(teams, current.teams, resp.teams)
            teams = teams.reduce((keys, arr) => [...Object.keys(arr), ...keys].flat().sort((a, b) => a - b), []).map((key, index) => teams.find(item => item[key])[key])
            return teams.join('')
        }
    }

    public static secToMin(sec) {
        let minutesLeft,
            secondsLeft,
            timeLeft

        secondsLeft = sec % 60 <= 9 ? '0'.concat(`${sec % 60}`) : sec % 60
        minutesLeft = `${secondsLeft.toString().includes('-') ? '-' : ''}${(sec - sec % 60) / 60 <= 9 ? '0'.concat(`${(sec - sec % 60) / 60}`) : (sec - sec % 60) / 60}`
        secondsLeft = secondsLeft.toString().replace('-', '')
        timeLeft = `${minutesLeft}:${secondsLeft}`

        return timeLeft
    }
}