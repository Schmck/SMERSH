import { Guid } from "guid-typescript"
import { Event } from ".."

export class PlayerIpAddressChangedEvent extends Event {
	constructor(Id: Guid, ipAddress: string, prevIpAddress: string) {
		super(Id)
		this.IpAddress = ipAddress;
		this.PrevIpAddress = prevIpAddress;
	}

	public IpAddress: string

	public PrevIpAddress: string;
}