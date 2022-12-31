import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { ReceiveChatLineCommand } from '../../Commands/Current'
import { Guid } from 'guid-typescript'
import { Team } from '../../SMERSH/ValueObjects'

export class ChatWatcher extends Watcher {

    public override Watch() {
        const session = WebAdminSession.get();


        const result = session.navigate(ChatRoute.GetChat.Action)
        return result.then(dom => {
            const messages = []
            if (dom) {
                dom.window.document.querySelectorAll(".chatmessage").forEach(msg => {
                    let username
                    let message
                    let visibility

                    if (msg.querySelector('.username')) {
                        username = msg.querySelector('.username').innerHTML
                    }

                    if (msg.querySelector('.message')) {
                        message = msg.querySelector('.message').innerHTML
                    }

                    if (msg.querySelector('.teamnotice')) {
                        visibility = msg.querySelector('.teamnotice').innerHTML
                    }
                    const usermsg = {
                        username,
                        message,
                        visibility,
                        timeStamp: new Date().toISOString()
                    }

                    messages.push(usermsg)
                })
            }

            messages.forEach(msg => {
                return this.commandBus.execute(new ReceiveChatLineCommand(Guid.create(), msg.name, msg.message, msg.timeStamp, Team.fromValue(msg.visibility)));
            })
        })
    }

}