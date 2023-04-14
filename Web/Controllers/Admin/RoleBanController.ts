import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { PlayersRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { SmershController } from '../../Framework';
import { Parsers } from '../../Utils';
import { CommandBus } from '@nestjs/cqrs'
import { RoleBanModel } from './RoleBanModel';
import { Role, Team } from '../../../SMERSH/ValueObjects';
import { ApplyRoleBanCommand } from '../../../Commands/Player'
import { Guid } from 'guid-typescript';


@Controller()
export class RoleBanController extends SmershController {
    public constructor(protected readonly commandBus: CommandBus) {
        super(commandBus)
    }

    @Post('/admin/rolebans')
    public postRoleBans(@Body()model: RoleBanModel) {
        Object.keys(model.Players).forEach(id => {
            let ban = model.Players[id]
            let sides = ban.sides
            let teams: Array<Team> = [];
            let roles: Array<Role> = [];

            ban.teams.forEach(team => {
                if (team === 'axis') {
                    teams.push(Team.Axis)
                }

                if (team === 'allies') {
                    teams.push(Team.Allies)
                }
            })

            ban.roles.forEach(role => {
                if (role === 'machinegunner') {
                    roles.push(Role.MachineGunner)
                }

                if (role === 'squadleader') {
                    roles.push(Role.SquadLeader)
                }

                if (role === 'eliteassault') {
                    roles.push(Role.EliteAssault)
                }

                if (role === 'commander') {
                    roles.push(Role.Commander)
                }

                if (role === 'eliterifleman') {
                    roles.push(Role.EliteRifleman)
                }
            })

            roles.forEach(role => {
                teams.forEach(team => {
                    sides.forEach(side => {
                        this.commandBus.execute(new ApplyRoleBanCommand(Guid.create(), id, ban.channelId, ban.aliases[0], "", role, team, side, new Date()))
                    })
                })
            })
            
        })
    }

}