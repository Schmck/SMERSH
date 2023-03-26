import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { PlayersRoute } from '../../../Services/WebAdmin/Routes';
import { Event } from '../../../Events';
import { SmershController } from '../../Framework';
import { Parsers } from '../../Utils';
import { EventBus } from '@nestjs/cqrs'
import { EventSearchReport } from '../../../Reports/Entities/eventStore';
import { SearchClient } from '../../../Elastic'


@Controller()
export class RebuildController extends SmershController {
    public constructor(protected readonly eventBus: EventBus) {
        super()
    }

    @Get('/rebuild')
    public async rebuild() {
        const eventType = Event
        const count = await SearchClient.Count<EventSearchReport>(EventSearchReport)
        const events = (await SearchClient.Search(EventSearchReport, {
            "size": count.count,
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