export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import {
    Event,
    ChatLinesReceivedEvent,
    PlayerRegisteredEvent,
    PlayerNameChangedEvent,
    RoundStartedEvent,
    RoundEndedEvent,
    MapChangedEvent,
    PlayerRoundUpdatedEvent,
    PolicyAppliedEvent,
    BanLiftedEvent,
    RoleBanAppliedEvent,
    RoleBanLiftedEvent,
    LayoutSavedEvent,
    MuteLiftedEvent,
    DiscordRoleAppliedEvent,
    LayoutRequirementsChangedEvent,
    PlayerIpAddressChangedEvent,
    VisibilityChangedEvent
} from '../Events'
import { SearchClient } from '../Elastic'
import { EventSearchReport } from '../Reports/Entities/eventStore';
import { Guid } from 'guid-typescript';
import { CommandBus } from '@nestjs/cqrs';
let cls: { new(id?: Guid, event?: Event): EventSearchReport } = EventSearchReport;



@EventsHandler(
    PlayerRegisteredEvent,
    PlayerNameChangedEvent,
    MapChangedEvent,
    RoundStartedEvent,
    ChatLinesReceivedEvent,
    RoundEndedEvent,
    PlayerRoundUpdatedEvent,
    PolicyAppliedEvent,
    BanLiftedEvent,
    RoleBanAppliedEvent,
    RoleBanLiftedEvent,
    LayoutSavedEvent,
    MuteLiftedEvent,
    DiscordRoleAppliedEvent,
    LayoutRequirementsChangedEvent,
    PlayerIpAddressChangedEvent,
    VisibilityChangedEvent
)
export class StoreEventHandler implements
    IEventHandler<PlayerRegisteredEvent>,
    IEventHandler<ChatLinesReceivedEvent>,
    IEventHandler<PlayerNameChangedEvent>,
    IEventHandler<RoundStartedEvent>,
    IEventHandler<RoundEndedEvent>,
    IEventHandler<MapChangedEvent>,
    IEventHandler<PlayerRoundUpdatedEvent>,
    IEventHandler<PolicyAppliedEvent>,
    IEventHandler<BanLiftedEvent>,
    IEventHandler<RoleBanAppliedEvent>,
    IEventHandler<RoleBanLiftedEvent>,
    IEventHandler<LayoutSavedEvent>,
    IEventHandler<MuteLiftedEvent>,
    IEventHandler<DiscordRoleAppliedEvent>,
    IEventHandler<LayoutRequirementsChangedEvent>,
    IEventHandler<PlayerIpAddressChangedEvent>,
    IEventHandler<VisibilityChangedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
        }

  
    async handle(event: PlayerRegisteredEvent)
    async handle(event: PlayerNameChangedEvent)
    async handle(event: RoundStartedEvent)
    async handle(event: RoundEndedEvent)
    async handle(event: MapChangedEvent)
    async handle(event: PlayerRoundUpdatedEvent) 
    async handle(event: ChatLinesReceivedEvent)
    async handle(event: PolicyAppliedEvent)
    async handle(event: BanLiftedEvent)
    async handle(event: RoleBanAppliedEvent)
    async handle(event: RoleBanLiftedEvent)
    async handle(event: LayoutSavedEvent)
    async handle(event: MuteLiftedEvent)
    async handle(event: DiscordRoleAppliedEvent)
    async handle(event: LayoutRequirementsChangedEvent)
    async handle(event: PlayerIpAddressChangedEvent)
    async handle(event: VisibilityChangedEvent)
    async handle(event: Event) {


        event.Id = event.Id.toString() as any as Guid
        let report: EventSearchReport = new cls(Guid.create(), event);


        if (event.constructor.name !== 'ChatLinesReceivedEvent') {
            console.log(event.constructor.name, JSON.stringify(event))
        }
        await SearchClient.Put(report);
        return;
    } 

}
    