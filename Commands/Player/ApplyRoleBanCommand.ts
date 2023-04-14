import { Guid } from "guid-typescript"
import { Command } from "../Command"
import { Action, Role } from "../../SMERSH/ValueObjects/player"
import { Team } from "../../SMERSH/ValueObjects";

export class ApplyRoleBanCommand extends Command {
	constructor(actionId: Guid, playerId: string, channelId: string, name: string, reason: string, role: Role, team: Team, side: string, banDate: Date, unbanDate?: Date) {
		super(actionId)

		this.PlayerId = playerId;
		this.ChannelId = channelId;
		this.Name = name;
		this.Reason = reason;
		this.Role = role;
		this.Team = team;
		this.Side = side;
		this.BanDate = banDate;
		this.UnbanDate = unbanDate;
	}

	public PlayerId: string;

	public ChannelId: string;

	public Name: string;

	public Reason: string;

	public Role: Role;

	public Team: Team;

	public Side: string;

	public BanDate: Date

	public UnbanDate?: Date



}