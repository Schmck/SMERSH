import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { ChatRoute } from '../../../Services/WebAdmin/Routes';
import { Config } from '../../Framework'
import * as Main from "dotenv/lib/main";

@Controller()
export class CurrentChatController {
    @Get(ChatRoute.GetChat.Action)
    public getCurrentChat() {
        //Main.config()
        const config = process.env;
        //const session = new WebAdminSession(config["BASE_URL"], config["AUTHCRED"])
        //const session = WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])
        let session = WebAdminSession.get();

        const result = session.navigate(ChatRoute.GetChat.Action)
        return result.then(page => {
            const messages = []
            if (page) {
                page.window.document.querySelectorAll(".chatmessage").forEach(msg => {
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