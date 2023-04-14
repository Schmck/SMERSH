export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PolicyQuery } from '../../Services/WebAdmin/Queries/PolicyQuery'
import { BanLiftedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PolicySearchReport } from '../../Reports/Entities/policy'
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
let cls: { new(id: Guid): PolicySearchReport } = PolicySearchReport;

@EventsHandler(BanLiftedEvent)
export class BanLiftedEventHandler implements IEventHandler<BanLiftedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
    }

    async handle(event: BanLiftedEvent) {
        let policy: Partial<PolicySearchReport> = new cls(event.Id);

        policy.IsActive = false;
        

        await SearchClient.Update(policy);
        return;
    }
}