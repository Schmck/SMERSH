import { Guid } from "guid-typescript"
import { Command } from "../Command"
import { Action } from "../../SMERSH/ValueObjects/player"

export class ApplyPolicyCommand extends Command {
	constructor(actionId: Guid, playerId: string, channelId: string, action: Action, name: string, reason: string, banDate: Date, unbanDate?: Date, plainId?: number) {
		super(actionId)

		this.PlayerId = playerId;
		this.ChannelId = channelId;
		this.Action = action;
		this.Name = name;
		this.Reason = reason;
		this.BanDate = banDate;
		this.UnbanDate = unbanDate;
		this.PlainId = plainId;
	}

	public PlayerId: string;

	public ChannelId: string;

	public Action: Action;

	public Name: string;

	public Reason: string

	public BanDate: Date

	public UnbanDate?: Date

	public PlainId?: number;

}