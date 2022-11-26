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
        return result.then(dom => {
            if (dom) {
                const table = dom.window.document.querySelector("#players");
                this.log.info('playerController', table)

                //const json = this.parseTable(table);
                if(table)
                    return { 'players': this.parseTable(table as HTMLTableElement) }
                else return 'bad luck'
            }
        })
    }

    public parseTable(table: HTMLTableElement) {
        console.log(table)
        const headers = Object.values((table).tHead.children).map(row => {
           return Object.values(row.children).map(item => {
                //this.log.info(item.innerHTML.replace(/(<([^>]+)>)/ig, ''))
               return item.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', '')
            })

              
        })
        const values = Object.values((table).tBodies[0].children).map(item => {
           return Object.values(item.children).map(row => {
                this.log.info(row.innerHTML.replace(/(<([^>]+)>)/ig, ''))
               return row.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', '')
           })
        }).map((val: any) => { val.pop(); return val })
        const result: any = { headers, values }

        return result.values.map(value => {
            return Object.fromEntries(value.map((val, index) => {
                return [[result.headers[0][index].replace(' ', '')], val ]
            }))
        })
    }
}