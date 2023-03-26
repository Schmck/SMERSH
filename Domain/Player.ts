import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { PlayerRegisteredEvent, PlayerNameChangedEvent, PolicyAppliedEvent, BanLiftedEvent } from '../Events/Player'
import { Action } from '../SMERSH/ValueObjects/player'

export class Player extends Domain {

    public Name: string;

    public constructor(id: Guid) {
        super(id)
    }


    public async register(name: string) {
        this.Name = name;

        this.apply(new PlayerRegisteredEvent(this.Id, this.Name));
        return;
    }

    public async changeName(name: string) {
        this.Name = name;
        this.apply(new PlayerNameChangedEvent(this.Id, this.Name));
        return;

    }

    public async applyPolicy(actionId: Guid, channelId: string, action: Action, name: string, reason: string, banDate: Date, unbanDate: Date, plainId?: number) {
        this.apply(new PolicyAppliedEvent(actionId, this.Id.toString(), channelId, action.DisplayName, name, reason, banDate, unbanDate, plainId));
        return;
    }

    public async liftBan(actionId: Guid) {
        this.apply(new BanLiftedEvent(actionId, this.Id));
        return;
    }
}