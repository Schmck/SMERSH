import { Guid } from "guid-typescript"
import { Command } from "../Command"

export class RegisterPlayerCommand extends Command {
	constructor(playerId: Guid, name: string, ip: string) {
		super(playerId)
		this.Name = name;
		this.Ip = ip;
	}

	public Name: string;

	public Ip: string;
}