import { Module } from '@nestjs/common';
import { CommandHandlers } from '../../CommandHandlers'
import { EventHandlers } from '../../EventHandlers'
import { Repository } from '../../CommandHandlers/Framework'
import { SmershModule } from './smersh.module';
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
    imports: [CqrsModule],
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
export class AppModule {

}