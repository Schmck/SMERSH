import { Guid } from "guid-typescript"
import { Event } from ".."

export class RoleBanLiftedEvent extends Event {
	constructor(id: Guid, playerId: string, role: number) {
		super(id)

		this.PlayerId = playerId;
		this.Role = role;
	}

	public PlayerId: string

	public Role: number;
}