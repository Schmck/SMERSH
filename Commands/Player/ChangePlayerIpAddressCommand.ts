import { Guid } from "guid-typescript"
import { Command } from "../Command"

export class ChangePlayerIpAddressCommand extends Command {
	constructor(playerId: Guid, ipAddress: string) {
		super(playerId)
		this.IpAddress = ipAddress;
	}

	public IpAddress: string
}