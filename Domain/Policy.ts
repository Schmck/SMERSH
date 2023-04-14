import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { PlayerRegisteredEvent, PlayerNameChangedEvent, PolicyAppliedEvent, BanLiftedEvent, RoleBanAppliedEvent, RoleBanLiftedEvent } from '../Events/Player'
import { Action } from '../SMERSH/ValueObjects/player'
import { Role, Team } from "../SMERSH/ValueObjects";
import { RoleBan } from '../SMERSH/ValueObjects'

export class Policy extends Domain {

    public PlayerId: string;

    public ChannelId: string;

    public Reason: string;

    public Name: string;

    public Action: string;

    public RoleBans: Record<number, Array<RoleBan>>   

    public IsActive: boolean;

    public BanDate: Date;

    public UnbanDate?: Date;

    public PlainId?: number;


    public constructor(id: Guid) {
        super(id)
    }

    public async applyRoleBan(playerId: string, channelId: string, name: string, reason: string, role: Role, team: Team, side: string, banDate: Date, unbanDate?: Date) {
        //if ((this.Roles && this.Roles.includes(role.Value)) && (this.Teams && this.Teams.includes(team.Value)) && (this.Sides && this.Sides.includes(side))) {
        if (this.RoleBans) {
            const roleBans = this.RoleBans[role.Value]
            let roleBan = roleBans && roleBans.find(roleBan => roleBan.Teams.includes(team.Value) || roleBan.Sides.includes(side))
            if (roleBans && roleBans.find(roleBan => roleBan.Sides.includes(side) && roleBan.Teams.includes(team.Value))) {
                return;
            }
            if (roleBan) {
                if (!roleBan.Sides.includes(side)) {
                    roleBan.Sides.push(side)
                }
                if (!roleBan.Teams.includes(team.Value)) {
                    roleBan.Teams.push(team.Value)
                }

            } else {
                roleBan = new RoleBan();
                roleBan.Teams = [team.Value]
                roleBan.Sides = [side]

                if (roleBans) {
                    this.RoleBans[role.Value] = [
                        ...this.RoleBans[role.Value],
                        roleBan
                    ]
                } else {
                    this.RoleBans[role.Value] = [
                        roleBan
                    ]
                }
                
            }

        } else {
            this.RoleBans = {}
            const roleBan = new RoleBan();
            roleBan.Teams = [team.Value]
            roleBan.Sides = [side]

            this.RoleBans[role.Value] = [
                roleBan
            ]
        }

        this.apply(new RoleBanAppliedEvent(this.Id, playerId, channelId, Action.RoleBan.DisplayName, name, reason, this.RoleBans, banDate, unbanDate));
        return;
    }

    public async liftRoleBan() {
        this.apply(new RoleBanLiftedEvent(this.Id, this.PlayerId));
        return;
    }

}