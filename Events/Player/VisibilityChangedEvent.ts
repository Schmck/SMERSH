import { Guid } from "guid-typescript"
import { Event } from "../Event"
import { Action, Role } from "../../SMERSH/ValueObjects/player"
import { Team } from "../../SMERSH/ValueObjects";

export class VisibilityChangedEvent extends Event {
	constructor(id: Guid, invisible: boolean) {
		super(id)

		this.Invisible = invisible;
	}

	public Invisible: boolean;
}