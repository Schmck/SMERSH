import { Guid } from "guid-typescript"
import { Event } from ".."

export class MuteLiftedEvent extends Event {
	constructor(id: Guid, playerId: string) {
		super(id)

		this.PlayerId = playerId;
	}

	public PlayerId: string
}