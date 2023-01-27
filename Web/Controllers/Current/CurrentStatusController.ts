import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { StatusRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { Parsers } from "../../Utils/Parsers";
import { StatusQuery } from '../../../Services/WebAdmin/Queries'

@Controller()
export class CurrentStatusController {
    constructor(
        private readonly commandBus: CommandBus
    ) { }

    @Get('/current/status')
    public async getCurrentStatus() {
        const result = await StatusQuery.Get();
        return result ?? 'bad luck'
    }
}