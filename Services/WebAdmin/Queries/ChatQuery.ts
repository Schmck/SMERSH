import { ChatRoute } from '../Routes';
import { WebAdminSession } from '..';
import { Parsers } from "../../../Web/Utils";
import { Query } from './Query';
import { PlayerQuery } from './PlayerQuery';
import { Player } from '../Models';
import { Message } from '../../../SMERSH/ValueObjects/round';

export class ChatQuery extends Query {

    public static async Get(): Promise<Array<Message>> {
        const session = WebAdminSession.get();
        const dom = await session.navigate(ChatRoute.GetChat.Action)
        const players = await PlayerQuery.GetPlayers();
        const messages = []

        //return result.then(dom => {
            if (dom && dom.window && dom.window.document) {
                dom.window.document.querySelectorAll(".chatmessage").forEach(async msg => {
                    let username
                    let message
                    let visibility
                    let team
                    let id

                    if (msg.querySelector('.username')) {
                        username = msg.querySelector('.username').textContent
                    }

                    if (msg.querySelector('.message')) {
                        message = msg.querySelector('.message').textContent
                    }

                    if (msg.querySelector('.teamnotice')) {
                        visibility = msg.querySelector('.teamnotice').textContent
                    }


                    if (msg.querySelector('.teamcolor')) {
                        team = (msg.querySelector('.teamcolor') as HTMLElement).style.background === 'rgb(143, 185, 176)';
                        team = team ? 'Axis' : 'Allies'
                    }

                    if (username) {
                        const player = players.find(player => player.Playername === username)
                        if (player) {
                            id = player.Id;
                        }
                    }


                    const usermsg = {
                        username,
                        id,
                        message,
                        visibility,
                        team,
                        timestamp: new Date().toISOString()
                    }

                    messages.push(usermsg)
                })
            }

            return messages
        //})
    }

    public async Post(value: string) {

    }
}