import { Guid } from "guid-typescript"
import { Command } from "../Command"
import { Action, Role } from "../../SMERSH/ValueObjects/player"
import { Team } from "../../SMERSH/ValueObjects";

export class LiftMuteCommand extends Command {
	constructor(actionId: Guid) {
		super(actionId)

	}
}