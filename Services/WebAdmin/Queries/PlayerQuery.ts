import { PolicyRoute } from '../Routes';
import { WebAdminSession } from '..';
import { Parsers } from "../../../Web/Utils";
import { StatusRoute, PlayersRoute } from '../Routes';
import { Query } from './Query';
import { PlayerSearchReport } from '../../../Reports/Entities/player';
import { Player, PlayerInfo } from '../Models';

export class PlayerQuery extends Query {

    public static async Get() : Promise<Array<PlayerInfo>> {
        const session = WebAdminSession.get();

        const status = await session.navigate(StatusRoute.GetStatus.Action)
        const admin = await session.navigate(PlayersRoute.GetPlayers.Action)

      
        let players : Array<PlayerInfo>

        if (status && status.window && status.window.document) {
            const playerTable = status.window.document.querySelector("#players");
         
            if (playerTable) {
                players = Parsers.playerTable(playerTable as HTMLTableElement);
                if (admin && admin.window && admin.window.document) {
                    const table = admin.window.document.querySelector("#players");
                    let playas;

                    if (table) {
                        playas = Parsers.playerTable(table as HTMLTableElement)
                        try {
                            players = players.map((player, i) => {
                                 const playa = playas.find(playa => playa.Playername === player.Playername)
                                 if(playa) {
                                 return Object.assign({}, player, { Id: playa.Id, IpAddress: playa.IP, PlayerKey: playa.PlayerKey })
                                 }
                                 return player
                             });
  
                         } catch (error) { }
                    }

                }
            }

           
            return players;
        }
        return [];
    }

    public static async GetByName(name: string): Promise<PlayerInfo> {
        const players = await this.Get();
        const player = players.find(playa => playa && playa.Playername && playa.Playername.toString() && playa.Playername.toString().toLowerCase().includes(name.toLowerCase()))
        return player;
    }

    public static async GetMultipleByName(name: string): Promise<Array<PlayerInfo>> {
        let players = await this.Get();
        players = players.filter(playa => playa && playa.Playername && playa.Playername.toString() && playa.Playername.toString().toLowerCase().includes(name.toLowerCase()))
        return players;
    }

    public static async GetById(id: string) : Promise<PlayerInfo> {
        const players = await this.Get();
        const player = players.find(playa => playa && playa.Id === id)
        return player;
    }

    public static async GetPlayer(name: string) : Promise<Player> {
        const session = WebAdminSession.get();

        const admin = await session.navigate(PlayersRoute.GetPlayers.Action)


        let players: Array<Player>;
        if (admin && admin.window && admin.window.document) {
            const table = admin.window.document.querySelector("#players");

            if (table) {
                players = Parsers.playerTable(table as HTMLTableElement)
            }

            return players.shift()
        }
        return null;
    }

    public static async GetPlayers() : Promise<Array<Player>> {
        const session = WebAdminSession.get();

        const admin = await session.navigate(PlayersRoute.GetPlayers.Action)


        let players: Array<Player>;
        if (admin && admin.window && admin.window.document) {
            const table = admin.window.document.querySelector("#players");

            if (table) {
                players = Parsers.playerTable(table as HTMLTableElement)
            }
        }
        return players
    }
}