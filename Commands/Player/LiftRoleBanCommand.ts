import { Guid } from "guid-typescript"
import { Command } from "../Command"
import { Action, Role } from "../../SMERSH/ValueObjects/player"
import { Team } from "../../SMERSH/ValueObjects";

export class LiftRoleBanCommand extends Command {
	constructor(actionId: Guid, Role: number) {
		super(actionId)

		this.Role = role;
	}

	public Role: number;
}