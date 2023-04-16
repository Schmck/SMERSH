import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { PlayersRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { SmershController, Api } from '../../Framework';
import { Parsers } from '../../Utils';
import axios, { isCancel, AxiosError, AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { CommandBus } from '@nestjs/cqrs'
import { ApplyPolicyCommand } from '../../../Commands/Player';
import { Guid } from "guid-typescript";
import { Action } from '../../../SMERSH/ValueObjects/player';


@Controller()
export class PolicyController extends SmershController {

    @Post('/admin/players/:playerName/unban')
    public postUnban(@Param('playerName') playerName: string) {

    }


    @Post('/admin/players/:playerName/:action')
    public postPolicy(@Param('playerName') playerName: string, @Param('action') action: string) {
        const session = WebAdminSession.get();

        this.log.info(playerName)
        const result = session.navigate(PlayersRoute.GetPlayers.Action)
        return result.then(async dom => {
            if (dom) {
                const table = dom.window.document.querySelector("#players");

                if (table) {
                    const parsed = Parsers.playerTable(table as HTMLTableElement);
                    const player = parsed.find(player => {
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
                    if (player) {
                        this.log.info(player.Playername)
                        const client = Api.axios();
                        const env = process.env;
                        const url = env["BASE_URL"] + PlayersRoute.CondemnPlayer.Action
                        const config: AxiosRequestConfig = 
                        {
                            headers: {
                                "Content-type": "application/x-www-form-urlencoded",
                                "Cookie": `authcred="${env["AUTHCRED"]}"`
                            },
                        }

                        const urlencoded = new URLSearchParams();
                        urlencoded.append("playerkey", player.PlayerKey);
                        urlencoded.append("ajax", '1');
                        urlencoded.append("action", action);


                        let response;

                        try {
                            response = await client.post(url, urlencoded, config).then(result => {
                                this.log.info(JSON.stringify(result))
                                return result
                            });
                        } catch(error) {
                            return 'worst luck'
                        }
                       

                        return {
                            resp: response.data,
                            statusCode: response.status,
                            player,
                        }
                        
                    } else return 'worse luck';
                } else return 'bad luck'
            }
        })
    }
}