import { CommandHandlers } from '../../CommandHandlers'
import { EventHandlers } from '../../EventHandlers/index'
import { Repository } from '../../CommandHandlers/Framework'
import { Module } from '@nestjs/common';
import { Logger, dummyLogger } from "ts-log/build/src/index"
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { OnModuleInit } from '@nestjs/common'
import { ChatWatcher } from '../../Watcher'

import { Event } from '../../Events'
import {
    CurrentStatusController,
    CurrentChatController
} from '../Controllers/Current';

import {
    PlayersController,
    PlayerController,
    PolicyController,
    LandingPageController,
    RebuildController
} from '../Controllers/Admin';

import {
    LayoutController
} from '../Controllers/Layout'


@Module({
    imports: [CqrsModule<Event>],
    controllers: [
        LandingPageController,
        RebuildController,

        CurrentStatusController,
        CurrentChatController,

        PlayersController,
        PlayerController,
        PolicyController,

        LayoutController
    ],
    providers: [
        Repository,
       ...CommandHandlers,
       ...EventHandlers
    ]
})
export class SmershModule implements OnModuleInit {

    

    public log : FileLogger

    public onModuleInit(): void {
        this.log = new FileLogger(`../logs/info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`)
        this.log.info('smersh module initiated', this)
    }
}
