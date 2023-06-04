import { exec } from "child_process";
import { Guid } from "guid-typescript"
import { Event } from ".."
import { RoleBan } from '../../SMERSH/ValueObjects'

export class RoleBanAppliedEvent extends Event {
	constructor(id: Guid, playerId: string, channelId: string, action: string, name: string, reason: string, executioner: string, roleBans: Record<number, RoleBan>, role: number, banDate: Date, unbanDate?: Date) {
		super(id)

		this.PlayerId = playerId;
		this.ChannelId = channelId;
		this.Action = action;
		this.Name = name;
		this.Reason = reason;
		this.Executioner = executioner;
		this.RoleBans = roleBans;
		this.Role = role;
		this.BanDate = banDate;
		this.UnbanDate = unbanDate;
	}

	public PlayerId: string;

	public ChannelId: string;

	public Action: string;

	public Name: string;

	public Reason: string;

	public Executioner: string;

	public RoleBans: Record<number, RoleBan>;

	public Role: number;

	public BanDate: Date;

	public UnbanDate?: Date;
}