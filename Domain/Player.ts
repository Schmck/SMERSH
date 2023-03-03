import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { PlayerRegisteredEvent, PlayerNameChangedEvent } from '../Events/Player'

export class Player extends Domain {

    public Name: string;

    public constructor(id: Guid) {
        super(id)
    }


    public async registerPlayer(name: string) {
        this.Name = name;
        this.apply(new PlayerRegisteredEvent(this.Id, this.Name))
    }

    public async changeName(name: string) {
        this.Name = name;
        this.apply(new PlayerNameChangedEvent(this.Id, this.Name))

    }
}