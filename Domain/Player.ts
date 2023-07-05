import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { PlayerRegisteredEvent, PlayerNameChangedEvent, PolicyAppliedEvent, DiscordRoleAppliedEvent, PlayerIpAddressChangedEvent, VisibilityChangedEvent } from '../Events/Player'
import { Action } from '../SMERSH/ValueObjects/player'

export class Player extends Domain {

    public Name: string;

    public Ip: string;

    public Role: number;

    public Invisible: boolean;

    public constructor(id: Guid) {
        super(id)
    }


    public async register(name: string, ip: string) {
        this.Name = name;
        this.Ip = ip;

        this.apply(new PlayerRegisteredEvent(this.Id, this.Name, this.Ip));
        return;
    }

    public async changeName(name: string) {
        const oldName = this.Name;
        this.Name = name;
        this.apply(new PlayerNameChangedEvent(this.Id, this.Name, oldName));
        return;

    }

    public async changeIpAddress(ip: string) {
        const oldIp = this.Ip;
        this.Ip = ip;
        this.apply(new PlayerIpAddressChangedEvent(this.Id, this.Ip, oldIp));
        return;

    }
    public async applyDiscordRole(role: number) {
        if (typeof (this.Role) === 'number' && this.Role === role) {
            return;
        }
        this.apply(new DiscordRoleAppliedEvent(this.Id, role))

    }

    public async changeVisibility(invisible: boolean) {
        if (this.Invisible === invisible) {
            return;
        }

        this.apply(new VisibilityChangedEvent(this.Id, invisible))
    }

    public async applyPolicy(actionId: Guid, channelId: string, action: Action, name: string, reason: string, executioner: string, banDate: Date, unbanDate?: Date, plainId?: number) {
        this.apply(new PolicyAppliedEvent(actionId, this.Id.toString(), channelId, action.DisplayName, name, reason, executioner, banDate, unbanDate, plainId));
        return;
    }
   
}