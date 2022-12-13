import { Guid } from "guid-typescript"
import { Command } from "../"

export class RegisterNewPlayerCommand extends Command {
	constructor(playerId: Guid, name: string) {
		super(playerId)
		this.Name = name;
	}

	public Name : string 
}