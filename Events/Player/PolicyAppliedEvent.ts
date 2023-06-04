import { Guid } from "guid-typescript"
import { Event } from ".."

export class PolicyAppliedEvent extends Event {
	constructor(id: Guid, playerId: string, channelId: string, action: string, name: string, reason: string, executioner: string, banDate: Date, unbanDate?: Date, plainId?: number) {
		super(id)

		this.PlayerId = playerId;
		this.ChannelId = channelId;
		this.Action = action;
		this.Name = name;
		this.Reason = reason;
		this.Executioner = executioner;
		this.BanDate = banDate;
		this.UnbanDate = unbanDate;
		this.PlainId = plainId;
	}

	public PlayerId: string;

	public ChannelId: string;

	public Action: string;

	public Name: string;

	public Reason: string;

	public Executioner: string;

	public BanDate: Date

	public UnbanDate?: Date

	public PlainId?: number
}