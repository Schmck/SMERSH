import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { PlayersRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { SmershController } from '../../Framework';
import { Parsers } from '../../Utils';


@Controller()
export class PlayersController extends SmershController {
    @Get('/admin/players')
    public getPlayers() {
        const session = WebAdminSession.get();

        const result = session.navigate(PlayersRoute.GetPlayers.Action)
        return result.then(dom => {
            if (dom) {
                const table = dom.window.document.querySelector("#players");

                if(table)
                    return { 'players': Parsers.playerTable(table as HTMLTableElement) }
                else return 'bad luck'
            }
        })
    }

}