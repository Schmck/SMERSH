import { Guid } from "guid-typescript"
import { Command } from "../"

export class ReceivePlayerChatLineCommand extends Command {
	constructor(playerId: Guid, name: string, line: string) {
		super(playerId)
		this.Name = name;
		this.Line = line;
	}

	public Name: string

	public Line : string
} 