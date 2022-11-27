import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { PlayersRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { SmershController } from '../../Framework';
import { Parsers } from '../../Utils';

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
                    const player = parsed.find(player => player && player.Playername && player.Playername.includes(playerName));
                    if (player) {
                        this.log.info(player.Playername)

                        return player
                    } else return 'worse luck';
                } else return 'bad luck'
            }
        })
    }
}