export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PlayerRoundUpdatedEvent } from '../../../Events'
import { SearchClient } from '../../../Elastic'
import { PlayerRoundSearchReport } from '../../../Reports/Entities/round/playerRound';
import { Guid } from 'guid-typescript';
import { CommandBus } from '@nestjs/cqrs';
let cls: { new(id?: Guid, mapId?: Guid): PlayerRoundSearchReport } = PlayerRoundSearchReport;

@EventsHandler(PlayerRoundUpdatedEvent)
export class PlayerRoundUpdatedEventHandler implements IEventHandler<PlayerRoundUpdatedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
    }

    async handle(event: PlayerRoundUpdatedEvent) {

        let partial: Partial<PlayerRoundSearchReport> = new cls(event.Id);

        partial.PlayerId = event.PlayerId;
        partial.RoundId = event.RoundId.toString();
        partial.Team = event.Team;
        partial.Role = event.Role;
        partial.Score = event.Score;
        partial.Kills = event.Kills;
        partial.Deaths = event.Deaths;

        await SearchClient.Put(partial);
        return;
    }
}