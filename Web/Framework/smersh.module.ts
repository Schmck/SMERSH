import { CommandHandlers } from '../../CommandHandlers'
import { EventHandlers } from '../../EventHandlers'
import { Repository } from '../../CommandHandlers/Framework'
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
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
    GetLayoutController,
    PostLayoutController,
    LayoutController
} from '../Controllers/Layout'


@Module({
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
       ...EventHandlers,
    ]
})
export class SmershModule {

}
