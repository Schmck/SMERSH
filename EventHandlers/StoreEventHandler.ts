export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import {
    Event,
    ChatLinesReceivedEvent,
    PlayerRegisteredEvent,
    PlayerNameChangedEvent,
    RoundStartedEvent,
    RoundEndedEvent,
    MapChangedEvent,
    PlayerRoundUpdatedEvent,
} from '../Events'
import { SearchClient } from '../Elastic'
import { EventSearchReport } from '../Reports/Entities/eventStore';
import { Guid } from 'guid-typescript';
import { CommandBus } from '@nestjs/cqrs';
import { Player } from '../Reports/Entities';
let cls: { new(id?: Guid, event?: Event): EventSearchReport } = EventSearchReport;



@EventsHandler(ChatLinesReceivedEvent)
@EventsHandler(PlayerRegisteredEvent)
@EventsHandler(PlayerNameChangedEvent)
@EventsHandler(RoundStartedEvent)
@EventsHandler(RoundEndedEvent)
@EventsHandler(MapChangedEvent)
@EventsHandler(PlayerRoundUpdatedEvent)
export class StoreEventHandler implements IEventHandler<ChatLinesReceivedEvent>,
    IEventHandler<PlayerRegisteredEvent>,
    IEventHandler<PlayerNameChangedEvent>,
    IEventHandler<RoundStartedEvent>,
    IEventHandler<RoundEndedEvent>,
    IEventHandler<MapChangedEvent>,
    IEventHandler<PlayerRoundUpdatedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
        }

    async handle(event: ChatLinesReceivedEvent)
    async handle(event: PlayerRegisteredEvent)
    async handle(event: PlayerNameChangedEvent)
    async handle(event: RoundStartedEvent)
    async handle(event: RoundEndedEvent)
    async handle(event: MapChangedEvent)
    async handle(event: PlayerRoundUpdatedEvent) 
    async handle(event: Event) {

        let report: EventSearchReport = new cls(Guid.create(), event);
       

        await SearchClient.Put(report);
        return;
    } 
}
    