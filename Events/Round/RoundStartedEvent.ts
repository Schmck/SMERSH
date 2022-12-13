import { Guid } from "guid-typescript"
import { Event } from "../"

export class RoundStartedEvent extends Event {
	constructor(roundId: Guid, mapName: string) {
		super(roundId)
		this.MapName = mapName;
	}

	public MapName: string
}