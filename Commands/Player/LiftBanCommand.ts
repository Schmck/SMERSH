import { Guid } from "guid-typescript"
import { Command } from "../Command"
import { Action } from "../../SMERSH/ValueObjects/player"

export class LiftBanCommand extends Command {
	constructor(actionId: Guid) {
		super(actionId)

	}

}