import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { ChatRoute } from '../../../Services/WebAdmin/Routes';
import { Config } from '../../Framework'

@Controller()
export class CurrentChatController {
    @Get('/current/chat')
    public getCurrentChat() {
        const session = new WebAdminSession(Config.get("url"), Config.get("authcred"))

        const result = session.navigate(ChatRoute.GetChat.Action)
        result.then(page => console.log(page))
    }
}