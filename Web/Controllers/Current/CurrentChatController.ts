import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { ChatRoute } from '../../../Services/WebAdmin/Routes';
import { Logger, dummyLogger, Logger as ILogger } from "ts-log";
import { Config } from '../../Framework'
import * as Main from "dotenv/lib/main";

@Controller()
export class CurrentChatController {
    public constructor(private readonly log: Logger = dummyLogger) { }



    @Get(ChatRoute.GetChat.Action)
    public getCurrentChat() {
        const session = WebAdminSession.get();

        const result = session.navigate(ChatRoute.GetChat.Action)
        return result.then(dom => {
            const messages = []
            this.log.info(dom)
            this.log.info(dom.window)
            this.log.info(dom.window.document)
            if (dom) {
                this.log.info(dom)
                this.log.info(dom.window)
                this.log.info(dom.window.document)
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
                        visibility
                    }
                    console.log(usermsg)
                    this.log.info(usermsg)
                    messages.push(usermsg)
                })
            }

            return dom.window.document.querySelectorAll(".chatmessage")
        })
    }
}