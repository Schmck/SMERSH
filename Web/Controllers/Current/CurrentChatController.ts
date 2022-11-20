import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { ChatRoute } from '../../../Services/WebAdmin/Routes';
import { Config } from '../../Framework'
import * as Main from "dotenv/lib/main";

@Controller()
export class CurrentChatController {
    @Get('/current/chat')
    public getCurrentChat() {
        //Main.config()
        const config = process.env;
        //const session = new WebAdminSession(config["BASE_URL"], config["AUTHCRED"])
        //const session = WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])
        let session = WebAdminSession.get();

        const result = session.navigate(ChatRoute.GetChat.Action)
        result.then(page => console.log(page))
    }
}