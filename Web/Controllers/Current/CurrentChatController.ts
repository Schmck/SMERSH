import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { ChatRoute } from '../../../Services/WebAdmin/Routes';
import { Config } from '../../Framework'
import * as Main from "dotenv/lib/main";

@Controller()
export class CurrentChatController {
    @Get(ChatRoute.GetChat.Action)
    public getCurrentChat() {
        const session = WebAdminSession.get();

        const result = session.navigate(ChatRoute.GetChat.Action)
        return result.then(dom => {
            const messages = []
            if (dom) {
                dom.window.document.querySelectorAll(".chatmessage").forEach(msg => {
                    let username = msg.querySelector('.username').innerHTML
                    let message = msg.querySelector('.message').innerHTML
                    let visibility = msg.querySelector('.teamnotice').innerHTML
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