import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { PlayersRoute } from '../../../Services/WebAdmin/Routes';
import { Event } from '../../../Events';
import { SmershController } from '../../Framework';
import { Parsers } from '../../Utils';
import { EventBus } from '@nestjs/cqrs'
import { EventSearchReport } from '../../../Reports/Entities/eventStore';
import { SearchClient } from '../../../Elastic'
import { Guid } from 'guid-typescript'

@Controller()
export class RebuildController extends SmershController {
    public constructor(protected readonly eventBus: EventBus) {
        super()
    }

    @Get('/rebuild/:type')
    public async rebuild(@Param('type') type?: string) {
        const eventType = Event
        const count = await SearchClient.Count<EventSearchReport>(EventSearchReport)
        let eventQuery: any = {
            "match_all": {}
        }

        if (type) {
            eventQuery = {
                "match": {
                    "Type": type,
                }
            }
        }

        const events = (await SearchClient.Search(EventSearchReport, {
            "size": count.count,
            "query": eventQuery,
            "sort": [
                {
                    "Date": {
                        "order": "desc"
                    }
                }
            ],
        }))

        for (let event of events) {
            const typedEvent = eval(`new Events_1.${event.Type}()`)

            const props = Object.keys(event.Event)
            props.forEach(prop => {
                const value = event.Event[prop]
                if (value && value.value) {
                    typedEvent[prop] = Guid.parse(value.value)
                } else if (typeof value === 'string' && value.match(/^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/)) {
                    typedEvent[prop] = Guid.parse(value)
                } else {
                    typedEvent[prop] = value
                }
            })

            this.eventBus.publish(typedEvent)
        }
    }

}