import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { PlayersRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { SmershController } from '../../Framework';
const HtmlTableToJson = require('html-table-to-json');

@Controller()
export class PlayersController extends SmershController {
    @Get('/admin/players')
    public getPlayers() {
        const session = WebAdminSession.get();

        const result = session.navigate(PlayersRoute.GetPlayers.Action)
        return result.then(async dom => {
            if (dom) {
                //this.log.info('playerController', dom.window.document.documentElement.innerHTML)
                this.log.info('playerController', dom.window.document.querySelector("#players"))
                const table = await dom.window.document.querySelector("#players");
                //const json = this.parseTable(table);
                if(table)
                    return this.parseTable(table as HTMLTableElement)
                else return 'bad luck'
            }
        })
    }

    public parseTable(table: HTMLTableElement) {
        console.log(table)
        const headers = Object.values((table as HTMLTableElement).tHead.children).map(row => {
            Object.values(row.children).map(item =>
                item.innerHTML.replace(/(<([^>]+)>)/ig, ''))
        })
        const values = Object.values((table as HTMLTableElement).tBodies[0].children).map(item => {
            Object.values(item.children).map(row => item.innerHTML.replace(/(<([^>]+)>)/ig, ''))
        })

        return {headers, values}
    }
}