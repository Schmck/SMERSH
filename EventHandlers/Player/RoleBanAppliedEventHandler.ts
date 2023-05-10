export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PolicyQuery } from '../../Services/WebAdmin/Queries/PolicyQuery'
import { RoleBanAppliedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PolicySearchReport } from '../../Reports/Entities/policy'
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";
import { Role, Team } from '../../SMERSH/ValueObjects';
import { SteamBot } from '../../SMERSH/Utilities/steam';

let cls: { new(id: Guid): PolicySearchReport } = PolicySearchReport;

@EventsHandler(RoleBanAppliedEvent)
export class RoleBanAppliedEventHandler implements IEventHandler<RoleBanAppliedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
        this.log = new FileLogger(`../logs/info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`)
        this.steam = SteamBot.get();
    }

    public steam: SteamBot;

    public log: FileLogger;


    async handle(event: RoleBanAppliedEvent) {
        let policy = new cls(event.Id);

        policy.PlayerId = event.PlayerId.toString();
        policy.ChannelId = event.ChannelId;
        policy.Action = event.Action;
        policy.Name = event.Name;
        policy.Reason = event.Reason;
        policy.RoleBans = event.RoleBans;
        policy.BanDate = event.BanDate;
        policy.UnbanDate = event.UnbanDate;
        policy.IsActive = true;

        await SearchClient.Update(policy);


        const roleBan = event.RoleBans[event.Role];
        const role = Role.fromValue<Role>(event.Role);
        const teams = roleBan.Teams.map(team => Team.fromValue<Team>(team).DisplayName).join('and ')
        const sides = roleBan.Sides.join('and ')
        const message = `you have been rolebanned from ${role.DisplayName} on ${teams} while ${sides}`

        await this.steam.sendMessageToFriend(event.PlayerId, `/pre this is an automated message integrated with ChatGPT`)
        await this.steam.sendMessageToFriend(event.PlayerId, message)
        return;
    }
}