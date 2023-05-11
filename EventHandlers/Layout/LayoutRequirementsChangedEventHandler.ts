export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { LayoutRequirementsChangedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { LayoutSearchReport } from '../../Reports/Entities/layout'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
let cls: { new(id: Guid): LayoutSearchReport } = LayoutSearchReport;

@EventsHandler(LayoutRequirementsChangedEvent)
export class LayoutRequirementsChangedEventHandler implements IEventHandler<LayoutRequirementsChangedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
    }

    async handle(event: LayoutRequirementsChangedEvent) {

        let layout = new cls(event.Id);

        layout.MinimumPlayerCount = event.MinimumPlayerCount;
        layout.MaximumPlayerCount = event.MaximumPlayerCount;
        layout.StartTime = event.StartTime;
        layout.EndTime = event.EndTime;

        await SearchClient.Update(layout);
        return;
    }
}