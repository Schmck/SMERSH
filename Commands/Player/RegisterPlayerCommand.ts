import { Guid } from "guid-typescript"
import { Command } from "../Command"

export class RegisterPlayerCommand extends Command {
	constructor(playerId: Guid, name: string) {
		super(playerId)
		this.Name = name;
	}

	public Name : string 
}