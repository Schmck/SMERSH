import { Guid } from "guid-typescript"
import { Command } from "../Command"
import { Action, Role } from "../../SMERSH/ValueObjects/player"
import { Team } from "../../SMERSH/ValueObjects";

export class ApplyDiscordRoleCommand extends Command {
	constructor(playerId: Guid, role: number) {
		super(playerId)

		this.Role = role;
	}

	public Role: number;



}