import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
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
                this.log.info('playerController', table)

                //const json = this.parseTable(table);
                if(table)
                    return { 'players': Parsers.parseTable(table as HTMLTableElement) }
                else return 'bad luck'
            }
        })
    }

}