import { Client } from "./Client";
import { TextChannel, Message } from 'discord.js';
import { PlayerInfo, Status } from '../../Services/WebAdmin/Models';
import { time } from "console";
import { channel } from "diagnostics_channel";
import { Utils } from "./Utils";
import { Message as Msg } from "../../SMERSH/ValueObjects/round"

export class Logger {

    private static Instance: Logger;

    public static async set(client: Client, logChannel: TextChannel, dashboardChannel: TextChannel, chatLogChannel: TextChannel, chatLog?: Message, scoreboard?: Message) {
        if (!this.Instance) {
            const log = logChannel.lastMessage;
            const lastChatLog = chatLogChannel.lastMessage;
            this.Instance = new Logger(client, logChannel, log, dashboardChannel, chatLog, scoreboard, chatLogChannel, lastChatLog)

            return this.Instance;
        }
    }

    public static get() {
        if (!this.Instance) {
            return null;
        }
        return this.Instance;
    }
    public constructor(client: Client, logChannel: TextChannel, logMessage: Message, dashboardChannel: TextChannel, chatLog?: Message, scoreboard?: Message, chatLogChannel?: TextChannel, lastChatLog?: Message) {

        this.Client = client;
        this.LogChannel = logChannel;
        this.DashboardChannel = dashboardChannel;
        this.ChatLogChannel = chatLogChannel;
        this.LastChatLog = lastChatLog;
        this.Log = logMessage;
        this.ChatLog = chatLog;
        this.Scoreboard = scoreboard;
        this.ChatLines = [];
        this.LogLines = [];
    }

    public static append(message: string) {
        const line = `${new Date().toTimeString().slice(0, 8)}\u2502 ${message}`
        if (this.Instance) {
            this.Instance.LogLines.push(line)
        }
    }

    public async publish(timeout: number = 5000) {
        if (this.LogLines.length) {
            const line = this.LogLines.shift();
            const validMessage = this.Log && this.Log.content && this.Log.content.length < 1800
            const validNewLine = line && validMessage && this.Log.content.length + line.length < 1900


            if (validMessage && validNewLine) {
                const newContent = `${this.Log.content.slice(0, this.Log.content.length - 3)} \n ${line} \`\`\``
                this.Log = await this.Log.edit(newContent)

            } else {
                this.Log = await this.LogChannel.send(`\`\`\`scala\n ${line} \`\`\``)
            }
        }

        setTimeout(() => {
            this.publish(timeout)
        }, timeout)
        return;
    }


    public static appendChatLine(line: Msg) {
        const chatLines = this.Instance.ChatLines[this.Instance.ChatLines.length - 1];
        if (chatLines && chatLines.length < 4) {
            chatLines.push(line)
        } else {
            this.Instance.ChatLines.push([line])
        }
        return;
    }

    public async publishDashboard(timeout : number = 1000) {
        this.publishChatLog();
        this.publishScoreboard();

        setTimeout(() => {
            this.publishDashboard(timeout)
        }, 1000)
        return;
    }

    public async publishChatLog() {
        if (this.ChatLines.flat().length) {
            const chatLog = this.generateChatLog()

            if (!this.ChatLog) {
                this.ChatLog = await this.DashboardChannel.send(chatLog)
            } else {
                this.ChatLog = await this.ChatLog.edit(chatLog);
            }

            if (this.LastChatLog && this.LastChatLog.content.length > 1800) {
                this.LastChatLog.edit(chatLog)
            }
            else if (this.ChatLogChannel) {
                this.ChatLogChannel.send(chatLog)
            }
        }
        return;
    }
   

    public async publishScoreboard() {
        const scoreboard = this.generateScoreboard(global.round)

        if (!this.Scoreboard) {
            this.Scoreboard = await this.DashboardChannel.send(scoreboard);
        } else {
            this.Scoreboard = await this.Scoreboard.edit(scoreboard);
        }
        return;

    }


    public generateChatLog() {
        const lines = this.ChatLines.shift().map(line => Utils.generateChatLine(line));
        let content = `${this.ChatLog.content.slice(0, this.ChatLog.content.length - 3).slice(this.ChatLog.content.match(/\+|\-/).index, this.ChatLog.content.length)}`
        let contentLines = content.split('\n')

        contentLines.push(...lines)
        contentLines.reduce((total, line) => {
            if (total > 1600) {
                let newTotal = total - line.length
                contentLines.shift()
                return newTotal
            }
            return total
        }, content.length + lines.join('\n').length)
        let newContent = `\`\`\`diff\n${contentLines.join('\n')}\`\`\``
        return newContent;
    }


    public generateScoreboard(round: Status, start: number = 0, end: number = 16) {
        let scoreboard = ''
        if (round && round.Players && round.Teams) {
            const axis = round.Players.filter(player => player.Team === 0 && !player.Bot).sort((playerA, playerB) => playerB.Score - playerA.Score)
            const allies = round.Players.filter(player => player.Team === 1 && !player.Bot).sort((playerA, playerB) => playerB.Score - playerA.Score)

            if (axis.slice(start, end).length > 1 && allies.slice(start, end).length > 1) {
                const combined = axis.slice(start, end).map((v, i) => [v, allies.slice(start, end)[i]]).reduce((a, b) => {
                    return a.concat(b)
                })

                let axisHeader = `${round.Teams[0].Name} - ${round.Teams[0].Attacking ? 'attacking' : 'defending'} - ${axis.length <= 9 ? axis.length + ' ' : axis.length}`
                let alliesHeader = `${round.Teams[1].Name} - ${round.Teams[1].Attacking ? 'attacking' : 'defending'}  - ${allies.length <= 9 ? allies.length + ' ' : allies.length}`
                let map = round.Game.Map.slice(round.Game.Map.indexOf('|') + 2).replace('\'', '')
                let minutesLeft,
                    secondsLeft,
                    timeLeft

                secondsLeft = round.Rules.TimeLeft % 60 <= 9 ? '0'.concat((round.Rules.TimeLeft % 60).toString()) : round.Rules.TimeLeft % 60
                minutesLeft = `${secondsLeft.toString().includes('-') ? '-' : ''}${(round.Rules.TimeLeft - round.Rules.TimeLeft % 60) / 60 <= 9 ? '0'.concat(((round.Rules.TimeLeft - round.Rules.TimeLeft % 60) / 60).toString()) : (round.Rules.TimeLeft - round.Rules.TimeLeft % 60) / 60}`
                secondsLeft = secondsLeft.toString().replace('-', '')
                timeLeft = `${minutesLeft}:${secondsLeft}`

                let mapHeader = ' '.repeat(42 - Math.ceil(map.length / 2)) + `- ${map} ${timeLeft} -`
                let teams = `\n[              ${axisHeader}           ][           ${alliesHeader}           ]`

                let emptyLineAxis = '[                      \u2502       \u2502          \u2502     \u2502     ]['
                let divider = '[\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500][\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500]\n'
                let emptyLineAllies = '[               \u2502       \u2502          \u2502     \u2502     ]'

                if (start === 0) {
                    scoreboard = '\n[ Name          \u2502 Score \u2502 Role     \u2502  K  \u2502  D  ][ Name          \u2502 Score \u2502 Role     \u2502  K  \u2502  D  ]\n'
                    scoreboard = mapHeader.concat(teams).concat(scoreboard).concat(divider)
                }
                combined.map((player, index) => {
                    if (player) {
                        let playerRole

                        if (player.Role && player.Role.match(/\b(\w)/g).length > 1 && !player.Role.includes('TANK') && !player.Role.includes('ELITE') && !player.Role.includes('RIFLE')) {
                            playerRole = player.Role.match(/\b(\w)/g).join('')

                        } else {
                            playerRole = player.Role.slice(0, 8)

                            if (player.Role === 'FLAMETHROWER') {
                                playerRole = 'FLAMER'
                            }

                            if (player.Role === 'MARKSMAN') {
                                playerRole = 'SNIPER'
                            }

                            if (player.Role === 'ELITE RIFLEMAN') {
                                playerRole = 'ERIFLE'
                            }

                            if (player.Role === 'ELITE ASSAULT') {
                                playerRole = 'EASSAULT'
                            }

                            if (player.Role.includes('TANK')) {
                                playerRole = 'TANK'
                            }

                            if (player.Role.includes('ANTI')) {
                                playerRole = 'ATGUNNER'
                            }

                            if (player.Role === 'COMMANDER') {
                                playerRole = 'TL'
                            }

                        }


                        let nameWhitespace = (13 - player.Playername.length) > 0 ? 13 - player.Playername.length : 0
                        let roleWhitespace = (8 - playerRole.length) > 0 ? 8 - playerRole.length : 0
                        let scoreWhitespace = (5 - player.Score.toString().length) > 0 ? 5 - player.Score.toString().length : 0
                        let killsWhitespace = (3 - player.Kills.toString().length) > 0 ? 3 - player.Kills.toString().length : 0
                        let deathWhitespace = (3 - player.Deaths.toString().length) > 0 ? 3 - player.Deaths.toString().length : 0

                        let name = `[ ${nameWhitespace === 0 ? player.Playername.replace(/\[/g, '|').replace(/\]/g, '|').slice(0, 13) : player.Playername.replace(/\[/g, '|').replace(/\]/g, '|')}${' '.repeat(nameWhitespace)} \u2502`
                        let score = ` ${player.Score}${' '.repeat(scoreWhitespace)} \u2502`
                        let role = ` ${playerRole}${' '.repeat(roleWhitespace)} \u2502`
                        let kills = ` ${player.Kills}${' '.repeat(killsWhitespace)} \u2502`
                        let deaths = ` ${player.Deaths}${' '.repeat(deathWhitespace)} ]${player.Team === 1 && index !== combined.length - 1 ? '\n' : ''}`

                        scoreboard = scoreboard.concat(name).concat(score).concat(role).concat(kills).concat(deaths)
                    } else if (index % 2 !== 0) {
                        scoreboard = scoreboard.concat(`${emptyLineAllies}${index !== combined.length - 1 ? '\n' : ''}`)
                    } else {
                        scoreboard = scoreboard.concat(emptyLineAxis)
                    }

                })
            }
        }
        return scoreboard
    }

    private Client: Client;

    private LogLines: Array<string>;
 
    private ChatLines: Array<Array<Msg>>;

    private DashboardChannel: TextChannel;

    private ChatLogChannel: TextChannel;

    private LogChannel: TextChannel;

    private Log: Message;

    private Scoreboard?: Message;

    private ChatLog?: Message;

    private LastChatLog?: Message;

}