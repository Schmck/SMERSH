import { Guid } from "guid-typescript"
import { Event } from "../"

export class NewPlayerRegisteredEvent extends Event {
	constructor(playerId: Guid, name: string) {
		super(playerId)
		this.Name = name;
	}

	public Name: string
}