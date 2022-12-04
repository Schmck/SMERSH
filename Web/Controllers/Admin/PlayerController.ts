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

                        return player
                    } else return 'worse luck';
                } else return 'bad luck'
            }
        })
    }
}