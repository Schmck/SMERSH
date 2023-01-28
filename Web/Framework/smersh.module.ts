import { CommandHandlers } from '../../CommandHandlers'
import { EventHandlers } from '../../EventHandlers'
import { Repository } from '../../CommandHandlers/Framework'
import { Module } from '@nestjs/common';
import { CqrsModule, CommandBus, EventBus } from '@nestjs/cqrs';
import { OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Event } from '../../Events'
import {
    CurrentStatusController,
    CurrentChatController
} from '../Controllers/Current';

import {
    PlayersController,
    PlayerController,
    CondemnPlayerController,
    LandingPageController
} from '../Controllers/Admin';

import {
    LayoutController
} from '../Controllers/Layout'


@Module({
    imports: [CqrsModule<Event>],
    controllers: [
        LandingPageController,

        CurrentStatusController,
        CurrentChatController,

        PlayersController,
        PlayerController,
        CondemnPlayerController,

        LayoutController
    ],
    providers: [
       Repository,
       ...CommandHandlers,
       ...EventHandlers
    ]
})
export class SmershModule implements OnModuleInit {

    public onModuleInit(): void {
        console.log('smersh module initiated', this)
    }
}
