import { ChatRoute } from '../Routes';
import { WebAdminSession } from '..';
import { Parsers } from "../../../Web/Utils";

export class ChatQuery {

    public static async Get() {
        const session = WebAdminSession.get();
        const result = session.navigate(ChatRoute.GetChat.Action)
        const messages = []

        return result.then(dom => {
            if (dom) {
                dom.window.document.querySelectorAll(".chatmessage").forEach(msg => {
                    let username
                    let message
                    let visibility
                    let team

                    if (msg.querySelector('.username')) {
                        username = msg.querySelector('.username').innerHTML
                    }

                    if (msg.querySelector('.message')) {
                        message = msg.querySelector('.message').innerHTML
                    }

                    if (msg.querySelector('.teamnotice')) {
                        visibility = msg.querySelector('.teamnotice').innerHTML
                    }


                    if (msg.querySelector('.teamcolor')) {
                        team = (msg.querySelector('.teamcolor') as HTMLElement).style.background === 'rgb(143, 185, 176)';
                        team = team ? 'Axis' : 'Allies'
                    }


                    const usermsg = {
                        username,
                        message,
                        visibility,
                        team,
                        timeStamp: new Date().toISOString()
                    }

                    messages.push(usermsg)
                })
            }

            return messages
        })
    }
}