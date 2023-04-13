import { Guid } from "guid-typescript"
import { Event } from ".."

export class PlayerNameChangedEvent extends Event {
	constructor(Id: Guid, name: string, prevName: string) {
		super(Id)
		this.Name = name;
		this.PrevName = prevName;
	}

	public Name: string

	public PrevName: string;
}