export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { LayoutSavedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { LayoutSearchReport } from '../../Reports/Entities/layout'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
let cls: { new(id: Guid): LayoutSearchReport } = LayoutSearchReport;

@EventsHandler(LayoutSavedEvent)
export class LayoutSavedEventHandler implements IEventHandler<LayoutSavedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
    }

    async handle(event: LayoutSavedEvent) {

        let layout = new cls(event.Id);
        layout.Name = event.Name;
        layout.Maps = event.Layout;
        layout.IsActive = event.IsActive;

        await SearchClient.Update(layout);
        return;
    }
}