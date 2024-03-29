import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { RoleBanAppliedEvent, RoleBanLiftedEvent, MuteLiftedEvent, BanLiftedEvent } from '../Events/Player'
import { Action } from '../SMERSH/ValueObjects/player'
import { Role, Team } from "../SMERSH/ValueObjects";
import { RoleBan } from '../SMERSH/ValueObjects'

export class Policy extends Domain {

    public PlayerId: string;

    public ChannelId: string;

    public Reason: string;

    public Name: string;

    public Action: string;

    public RoleBans: Record<number, RoleBan>   

    public IsActive: boolean;

    public Executioner: string;

    public BanDate: Date;

    public UnbanDate?: Date;

    public PlainId?: number;


    public constructor(id: Guid) {
        super(id)
    }

    public async applyRoleBan(playerId: string, channelId: string, name: string, reason: string, role: Role, team: Team, side: string, executioner: string, banDate: Date, unbanDate?: Date) {
        if (this.RoleBans) {
            let roleBan = this.RoleBans[role.Value]


            if (roleBan && roleBan.Sides.includes(side) && roleBan.Teams.includes(team.Value)) {
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

                this.RoleBans[role.Value] = roleBan
                
            }

        } else {
            this.RoleBans = {}
            const roleBan = new RoleBan();
            roleBan.Teams = [team.Value]
            roleBan.Sides = [side]

            this.RoleBans[role.Value] = roleBan
            
        }
        this.Executioner = executioner;

        this.apply(new RoleBanAppliedEvent(this.Id, playerId, channelId, Action.RoleBan.DisplayName, name, reason, this.Executioner, this.RoleBans, role.Value, banDate, unbanDate));
        return;
    }

    public async liftBan() {
        this.apply(new BanLiftedEvent(this.Id, this.PlayerId));
        return;
    }

    public async liftRoleBan(role: number) {
        this.apply(new RoleBanLiftedEvent(this.Id, this.PlayerId, role));
        return;
    }

    public async liftMute() {
        this.apply(new MuteLiftedEvent(this.Id, this.PlayerId));
        return;
    }

}