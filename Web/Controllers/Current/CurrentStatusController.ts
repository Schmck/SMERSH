import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { StatusRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { Parsers } from "../../Utils/Parsers";

@Controller()
export class CurrentStatusController {
    @Get('/current/status')
    public getCurrentStatus() {
        const session = WebAdminSession.get();

        const result = session.navigate(StatusRoute.GetStatus.Action)
        return result.then(dom => {
            let current = {}
            let rules = {}
            let players
            let teams

            if (dom) {
                const playerTable = dom.window.document.querySelector("#players");
                const teamTable = dom.window.document.querySelector("#teams");
                const currentDl = dom.window.document.querySelector("#currentGame");
                const rulesDl = dom.window.document.querySelector("#currentRules");

                if (playerTable) {
                    players = Parsers.playerTable(playerTable as HTMLTableElement);
                }

                if (teamTable) {
                    teams = Parsers.parseTable(teamTable as HTMLTableElement);
                }

                if (currentDl) {
                    current = Parsers.dlElement(currentDl)
                }

                if (rulesDl) {
                    rules = Parsers.dlElement(rulesDl)
                }


                return {
                    players,
                    teams,
                    current,
                    rules,
                };
            } else return 'bad luck';
        })
    }
}