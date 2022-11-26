import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { ChatRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';

@Controller()
export class PlayersController {
    @Get('/admin/players')
    public GetPlayers() {
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
                    messages.push({
                        username,
                        message,
                        visibility
                    })
                })
            }

            return messages
        })
    }
}