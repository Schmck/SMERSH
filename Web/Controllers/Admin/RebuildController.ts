import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { PlayersRoute } from '../../../Services/WebAdmin/Routes';
import {
    ChatLinesReceivedEvent,
    PlayerRegisteredEvent,
    PlayerNameChangedEvent,
    RoundStartedEvent,
    RoundEndedEvent,
    MapChangedEvent,
    PlayerRoundUpdatedEvent,
} from '../../../Events';
import { SmershController } from '../../Framework';
import { Parsers } from '../../Utils';
import { EventBus, CommandBus } from '@nestjs/cqrs'
import { EventSearchReport } from '../../../Reports/Entities/eventStore';
import { SearchClient } from '../../../Elastic'

@Controller()
export class RebuildController extends SmershController {
    public constructor(protected readonly eventBus: EventBus) {
        super()
    }

    @Get('/rebuild')
    public async rebuild() {
        const eventTypes = [
            ChatLinesReceivedEvent,
            PlayerRegisteredEvent,
            PlayerNameChangedEvent,
            RoundStartedEvent,
            RoundEndedEvent,
            MapChangedEvent,
            PlayerRoundUpdatedEvent,
        ]
        const events = (await SearchClient.Search(EventSearchReport, {
            "query": {
                "match_all": {}
            }
        }))

        for (let event of events) {
            const typedEvent = eval(`new Events_1.${event.Type}()`)

            const props = Object.keys(event.Event)
            props.forEach(prop => {
                const value = event.Event[prop]
                typedEvent[prop] = value
            })

            this.eventBus.publish(typedEvent)
        }
    }

}