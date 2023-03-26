export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PolicyQuery } from '../../Services/WebAdmin/Queries/PolicyQuery'
import { PolicyAppliedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PolicySearchReport } from '../../Reports/Entities/policy'
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";

let cls: { new(id: Guid): PolicySearchReport } = PolicySearchReport;

@EventsHandler(PolicyAppliedEvent)
export class PolicyAppliedEventHandler implements IEventHandler<PolicyAppliedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
        this.log = new FileLogger(`../logs/info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`)
    }

    public log: FileLogger;


    async handle(event: PolicyAppliedEvent) {
        let policy = new cls(event.Id);


        //this.log.info(JSON.stringify(event))
        policy.PlayerId = event.PlayerId.toString();
        policy.ChannelId = event.ChannelId;
        policy.Action = event.Action;
        policy.Reason = event.Reason;
        policy.BanDate = event.BanDate;
        policy.UnbanDate = event.UnbanDate;
        policy.PlainId = event.PlainId;
        policy.IsActive = true;

        await SearchClient.Put(policy);
        return;
    }
}