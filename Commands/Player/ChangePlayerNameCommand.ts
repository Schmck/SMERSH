import { Guid } from "guid-typescript"
import { Command } from "../Command"

export class ChangePlayerNameCommand extends Command {
	constructor(playerId: Guid, name: string) {
		super(playerId)
		this.Name = name;
	}

	public Name: string
}