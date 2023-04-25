import { Guid } from "guid-typescript"
import { Event } from "../Event"
import { Action, Role } from "../../SMERSH/ValueObjects/player"
import { Team } from "../../SMERSH/ValueObjects";

export class DiscordRoleAppliedEvent extends Event {
	constructor(playerId: Guid, role: number) {
		super(playerId)

		this.Role = role;
	}

	public Role: number;



}