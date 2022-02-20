import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';

@Controller()
export class CurrentStatusController {
    @Get('/current/status')
    public getCurrentStatus() {

    }
}