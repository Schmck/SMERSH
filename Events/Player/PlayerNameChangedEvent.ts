import { Guid } from "guid-typescript"
import { Event } from ".."

export class PlayerNameChangedEvent extends Event {
	constructor(Id: Guid, name: string) {
		super(Id)
		this.Name = name;
	}

	public Name: string
}