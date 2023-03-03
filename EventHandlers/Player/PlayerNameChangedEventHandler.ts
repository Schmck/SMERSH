export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PlayerNameChangedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
let cls: { new(id: Guid): PlayerSearchReport } = PlayerSearchReport;

@EventsHandler(PlayerNameChangedEvent)
export class PlayerNameChangedEventHandler implements IEventHandler<PlayerNameChangedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
    }

    async handle(event: PlayerNameChangedEvent) {
        let player = new cls(event.Id);
        player.Name = event.Name;
        await SearchClient.Put(player)

        return;
    }
}