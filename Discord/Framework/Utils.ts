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
}