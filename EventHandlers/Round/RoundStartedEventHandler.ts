export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { RoundStartedEvent, ChatLinesReceivedEvent, PlayerRegisteredEvent, Event } from '../../Events'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { MapSearchReport } from '../../Reports/Entities/map'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { Client } from '../../Discord/Framework';
let cls: { new(id: Guid, mapId: Guid): RoundSearchReport } = RoundSearchReport;
let map: { new(id: Guid): MapSearchReport } = MapSearchReport;

@EventsHandler(RoundStartedEvent)
export class RoundStartedEventHandler implements IEventHandler<RoundStartedEvent>
{
    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = JSON.parse(process.argv[process.argv.length - 1])["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
    }

    async handle(event: RoundStartedEvent) {

        let partial: Partial<RoundSearchReport> = new cls(event.Id, event.MapId);
        partial.Players = event.Players;

        await SearchClient.Update(partial);

        let partialMap: Partial<MapSearchReport> = new map(event.MapId)
        partialMap.TimeLimit = event.TimeLimit;

        delete partialMap.MapName;
        delete partialMap.Layouts;
        delete partialMap.Tickets;

        await SearchClient.Update(partialMap);
        return;
    }
}