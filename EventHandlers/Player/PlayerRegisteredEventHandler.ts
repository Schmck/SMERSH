export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PlayerRegisteredEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
let cls: { new(id: Guid): PlayerSearchReport } = PlayerSearchReport;

@EventsHandler(PlayerRegisteredEvent)
export class PlayerRegisteredEventHandler implements IEventHandler<PlayerRegisteredEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
    }

    async handle(event: PlayerRegisteredEvent) {
        let player = new cls(event.Id);
        player.Name = event.Name;

        await SearchClient.Put(player);

        return;
    }
}