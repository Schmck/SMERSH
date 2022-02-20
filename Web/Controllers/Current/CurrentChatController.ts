import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';

@Controller()
export class CurrentChatController {
    @Get('/current/chat')
    public getCurrentChat() {

    }
}