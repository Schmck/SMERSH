export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { VisibilityChangedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { Client, Logger } from '../../Discord/Framework';
let cls: { new(id: Guid): PlayerSearchReport } = PlayerSearchReport;

@EventsHandler(VisibilityChangedEvent)
export class VisibilityChangedEventHandler implements IEventHandler<VisibilityChangedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
    }

    async handle(event: VisibilityChangedEvent) {
        let player = new cls(event.Id);
        player.Invisible = event.Invisible;
        await SearchClient.Update(player)

        return;
    }
}