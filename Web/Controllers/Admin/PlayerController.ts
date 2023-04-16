import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs'
import { PlayersRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { SmershController } from '../../Framework';
import { Parsers } from '../../Utils';
import axios, { isCancel, AxiosError } from 'axios';
import * as dotenv from 'dotenv';

@Controller()
export class PlayerController extends SmershController {

    @Get('/admin/players/:playerName')
    public getPlayer(@Param("playerName") playerName: string) {
        const session = WebAdminSession.get();

        this.log.info(playerName)

        const result = session.navigate(PlayersRoute.GetPlayers.Action)
        return result.then(dom => {
            if (dom) {
                const table = dom.window.document.querySelector("#players");

                if (table) {
                    const parsed = Parsers.playerTable(table as HTMLTableElement);
                    const players = parsed.filter(player => {
                        if (playerName.match(/0x011[0]{4}[A-Z0-9]{9,10}/) || playerName.match(/[A-Z0-9]{9,10}/)) {
                            let guid = playerName
                            if (guid.match(/[A-Z0-9]{9,10}/) && !guid.startsWith('0x011')) {
                                guid = `0x0110000${guid}`;
                            }
                            return player && player.UniqueID && player.UniqueID === guid
                        } else {
                            return player && player.Playername && player.Playername.includes(playerName)
                        }
                    });
                    if (players) {
                        this.log.info(players)

                        return players
                    } else return 'worse luck';
                } else return 'bad luck'
            }
        })
    }

    
}