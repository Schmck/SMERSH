import { Guid } from "guid-typescript"
import { Event } from ".."

export class PlayerRegisteredEvent extends Event {
	constructor(playerId: Guid, name: string, ip: string) {
		super(playerId)
		this.Name = name;
		this.Ip = ip;
	}

	public Name: string;

	public Ip: string;
}