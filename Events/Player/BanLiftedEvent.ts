import { Guid } from "guid-typescript"
import { Event } from ".."

export class BanLiftedEvent extends Event {
	constructor(id: Guid, playerId: Guid) {
		super(id)

		this.PlayerId = playerId;
	}

	public PlayerId: Guid
}