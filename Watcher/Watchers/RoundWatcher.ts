import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { Status } from '../../Services/WebAdmin/Models';
import { StartRoundCommand, EndRoundCommand, ChangeMapCommand  } from '../../Commands/Round'
import { UpdatePlayerRoundCommand  } from '../../Commands/Round/PlayerRound'
import { RegisterPlayerCommand, ChangePlayerNameCommand  } from '../../Commands/Player'
import { StatusQuery } from '../../Services/WebAdmin/Queries'
import { Guid } from 'guid-typescript'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { MapSearchReport } from '../../Reports/Entities/map';
import { PlayerSearchReport } from '../../Reports/Entities/player';
import { stringify } from 'querystring';
import SteamApi from 'steamapi'
import { hexToDec } from 'hex2dec'
import { Role, Team } from '../../SMERSH/ValueObjects';
import { stat } from 'fs';
import { Logger } from '../../Discord/Framework';
import { ActivityType } from 'discord.js';

export class RoundWatcher extends Watcher {

    public override async Watch(timeout = 100, ...args: Array<{status: Status, mapTime: number, lastLogTime:Date}>) {
        const status = await StatusQuery.Get();
        const prevStatus = args[0] && args[0].status;
        let lastLogTime = args[0] && args[0].lastLogTime || new Date();
        let prevMapTime = args[0] && args[0].mapTime
        let mapTime = (prevStatus && prevStatus.Rules && prevStatus.Rules.TimeLeft) || 0

        if (status) { 
            let oldMap = prevStatus && prevStatus.Game && prevStatus.Game.Map;
            let newMap = status && status.Game && status.Game.Map

            const map = newMap && (await SearchClient.Search(MapSearchReport, {
                "query": {
                    "match": {
                        "MapName": newMap,
                    }
                }
            })).shift()
        

            if (oldMap && newMap && oldMap !== newMap) {
                const mapId = map && map.Id ? Guid.parse(map.Id) : Guid.create();
                const roundId = Guid.create();

                await this.commandBus.execute(new ChangeMapCommand(roundId, mapId, newMap))
            }

            if (map) {
                let roundQuery = {
                    "size": 1,
                    "sort": [
                        {
                            "Date": {
                                "order": "desc"
                            }
                        }
                    ],
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "MapId": map.Id,
                                    }
                                },
                                {
                                    "match": {
                                        "IsActive": true
                                    }
                                }
                            ]
                        }
                    }
                };

                const round = (await SearchClient.Search(RoundSearchReport, roundQuery)).shift()
                const playerIds: string[] = status.Players ? status.Players.map(player => player.Id).filter(id => id) : []
                const timeLimit = status.Rules && status.Rules.TimeLimit ? status.Rules.TimeLimit : 0
                const newMapTime = status.Rules && status.Rules.TimeLeft ? status.Rules.TimeLeft : 0
                const thereBeBots = status.Players.every(player => !player.Bot)


                if (round && mapTime && timeLimit && timeLimit === mapTime) {
                    await this.commandBus.execute(new StartRoundCommand(Guid.parse(round.Id), timeLimit, new Date(), playerIds))
                }

                if (round && newMapTime && newMapTime === mapTime && mapTime !== prevMapTime) {
                    await this.commandBus.execute(new EndRoundCommand(Guid.parse(round.Id), new Date(), playerIds));
                }


                if (playerIds.length) {
                    for (let playerId of playerIds) {
                        const exists = await SearchClient.Get(playerId as any as Guid, PlayerSearchReport)
                        const player = status.Players.find(player => player.Id === playerId)
                        
                        

                        if (!exists) {
                            if (player && player.Id) {
                                const decId = hexToDec(player.Id)
                                let playa 
                                try {
                                    playa = decId && await this.steam.getUserSummary(decId)
                                } catch (error) {
                                    console.log(error)
                                }

                                if (playa && player.Playername !== playa.nickname) {
                                    this.log.info(player.Id, player.Playername, playa.nickname, playa.steamID)
                                    await this.commandBus.execute(new RegisterPlayerCommand(player.Id, playa.nickname))

                                } else {
                                    await this.commandBus.execute(new RegisterPlayerCommand(player.Id, player.Playername))

                                }


                            }
                        } else if (player && exists.Name !== player.Playername) {
                            const decId = hexToDec(player.Id)
                            let playa
                            try {
                                playa = decId && await this.steam.getUserSummary(decId)
                            } catch (error) {
                                console.log(error)
                            }

                            if(playa && player.Playername === playa.nickname) {
                                await this.commandBus.execute(new ChangePlayerNameCommand(player.Id, player.Playername))
                            }
                        }

                        if (exists && status && status.Teams && status.Teams.length && round && thereBeBots && player && player.Id && newMapTime && newMapTime === mapTime && mapTime !== prevMapTime) {
                            const team = Team.fromValue<Team>(player.Team);
                            const role = Role.fromDisplayName<Role>(player.Role);
                            const id = Guid.parse((round.Id.toString().slice(0, 27) + playerId.slice(9)))

                            if (team && role && (player.Kills || player.Score > 5) ) {
                                const attacking = status.Teams[player.Team].Attacking

                                await this.commandBus.execute(new UpdatePlayerRoundCommand(id, player.Id, Guid.parse(round.Id), team.Value, role.Value, attacking, player.Score, player.Kills, player.Deaths))
                            }
                        }
                    }
                }

                if ((lastLogTime.getMinutes() + 5) === new Date().getMinutes() && !(new Date().getMinutes() % 5)) {
                    const env = JSON.parse(process.argv[process.argv.length - 1]);
                    let crossedSwords = `\u2694`
                    let shield = `\u26CA`
                    let axisIcon = `\u2720`
                    let alliesIcon = '\u262D'

                    if (env["GAME"] === "RS1") {
                        axisIcon = `\u6698`
                        alliesIcon = `\u272A`
                    }

                    const axisPlayers = status.Players.filter(p => !p.Team).length
                    const alliesPlayers = status.Players.filter(p => !p.Team).length
                    const attacking = status.Teams.map(team => team.Attacking ? crossedSwords : shield).join('')
                    lastLogTime = new Date();
                    Logger.append(`there are currently ${status.Players.filter(p => !p.Bot).length} players ${axisIcon}${axisPlayers}${attacking}${alliesPlayers}${alliesIcon}`)

                }

                if (!(new Date().getSeconds() % 5)) {
                    this.handleDiscordStatus(status)
                }
            } else {
                const mapId = map && map.Id ? Guid.parse(map.Id) : Guid.create();
                const roundId = Guid.create();

                await this.commandBus.execute(new ChangeMapCommand(roundId, mapId, newMap))
            }
            
    }

        setTimeout(() => {
            this.Watch(timeout, { status: status ?? prevStatus, mapTime, lastLogTime })
        }, timeout)
    }

    public handleDiscordStatus(status: Status) {
        const env = JSON.parse(process.argv[process.argv.length - 1]);
        let crossedSwords = `\u2694`
        let shield = `\u26CA`
        let axisIcon = `\u2720`
        let alliesIcon = '\u262D'

        if (env["GAME"] === "RS1") {
            axisIcon = `\u6698`
            alliesIcon = `\u272A`
        }
        const attacking = status.Teams.map(team => team.Attacking ? `\u2694` : `\u26CA`).join('')
        let statusMap,
            timeLeft,
            territories

        statusMap = status.Game.Map.replace('\'', '')
        statusMap = statusMap.slice(statusMap.indexOf('|') + 2, statusMap.length)
        timeLeft = this.secToMin(status.Rules.TimeLeft)

        territories = `\u2720${status.Teams[0].Territories}/${status.Teams[1].Territories}\u262D`

        let stats = status.Players.reduce((stats, player) => {
            const team = player.Team ? 'allies' : 'axis'
            stats.scores[team] += player.Score
            stats.count[team].total += 1

            if (player.Bot) {
                stats.count[team].bots += 1
                stats.count.bots += 1
            } else {
                stats.count[team].players += 1
                stats.count.players += 1
            }

            stats.count.total++
            return stats
        }, {
            scores: { axis: 0, allies: 0 },
            count: {
                bots: 0,
                players: 0,
                total: 0,
                axis: { bots: 0, players: 0, total: 0 },
                allies: { bots: 0, players: 0, total: 0 }
            }
        })
        const scores = `\u2720${stats.scores.axis}/${stats.scores.allies}\u262D`
        const teamCount = `\u2720${stats.count.axis.players}${attacking}${stats.count.allies.players}\u262D`
        let discordStatus = ''



        if (stats.count.total === 1) {
            discordStatus += `${stats.count.total} player`
        } else if (stats.count.players && stats.count.players > stats.count.bots) {
            discordStatus += `${stats.count.players} players`
        } else if (!stats.count.players && stats.count.bots > 1) {
            discordStatus = `${stats.count.bots} bots`
        } else {
            discordStatus += `${stats.count.players} players`
        }

        if (statusMap.length) {
            discordStatus += ` on ${statusMap}`
        }

        if (timeLeft.length) {
            discordStatus += ` ${timeLeft}`
        }

        if (teamCount.length && stats.count.players > stats.count.bots) {
            discordStatus += ` ${teamCount}`
        }

        if (territories.length) {
            discordStatus += `${territories}`
        }

        if (scores.length) {
            discordStatus += ` ${scores}`
        }




        this.client.user.setPresence({
            activities: [{
                name: discordStatus,
                type: ActivityType.Watching
            }],
            status: 'online'
        })
    }

    public secToMin(sec : number) {
        let minutesLeft,
            secondsLeft,
            timeLeft

        secondsLeft = sec % 60 <= 9 ? '0'.concat((sec % 60).toString()) : sec % 60
        minutesLeft = `${secondsLeft.toString().includes('-') ? '-' : ''}${(sec - sec % 60) / 60 <= 9 ? '0'.concat(((sec - sec % 60) / 60).toString()) : (sec - sec % 60) / 60}`
        secondsLeft = secondsLeft.toString().replace('-', '')
        timeLeft = `${minutesLeft}:${secondsLeft}`

        return timeLeft
    }
}