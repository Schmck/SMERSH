import { StatusRoute, PlayersRoute } from '../Routes';
import { WebAdminSession } from '..';
import { Parsers } from "../../../Web/Utils";
import { time } from 'console';


export class StatusQuery {
    public static async Get() {
        const session = WebAdminSession.get();

        const status = session.navigate(StatusRoute.GetStatus.Action)
        const admin = await session.navigate(PlayersRoute.GetPlayers.Action)
       
        return status.then(dom => {
            let game = {}
            let rules = {}
            let players
            let teams

            if (dom && dom.window && dom.window.document) {
                const playerTable = dom.window.document.querySelector("#players");
                const teamTable = dom.window.document.querySelector("#teams");
                const currentDl = dom.window.document.querySelector("#currentGame");
                const rulesDl = dom.window.document.querySelector("#currentRules");

                if (playerTable) {
                    players = Parsers.playerTable(playerTable as HTMLTableElement);
                    if (admin  && admin.window && admin.window.document) {
                        const table = admin.window.document.querySelector("#players");
                        let playas;

                        if (table) {
                            playas = Parsers.playerTable(table as HTMLTableElement)
                            try {
                                players = players.map((item, i) => Object.assign({}, item, { Id: playas[i].UniqueID }));

                            } catch (error) { }
                        }
                        
                    }
                }

                if (teamTable) {
                    teams = Parsers.parseTable(teamTable as HTMLTableElement);
                }

                if (currentDl) {
                    game = Parsers.dlElement(currentDl);
                }

                if (rulesDl) {
                    rules = Parsers.dlElement(rulesDl);
                    let [timeLimit, timeLeft] = rules['TimeLimit'].replace(/[^\d+|\s]/g, '').split(' ').filter(r => r)
                    rules['TimeLimit'] = timeLimit;
                    rules['TimeLeft'] = timeLeft;
                }


                return {
                    players,
                    teams,
                    game,
                    rules,
                };
            }

            return;
            })
    }
}