import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { LayoutRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { SmershController, Api } from '../../Framework';
import { Parsers } from '../../Utils';

@Controller()
export class GetLayoutController extends SmershController {

    @Get('/layout')
    public getLayout() {
        const session = WebAdminSession.get();

       
        const result = session.navigate(LayoutRoute.GetLayout.Action)
        return result.then(async dom => {
            if (dom) {
                const campaign = Object.values(dom.window.document.querySelectorAll(`[id^='sgterritory_']`))
                const layout = Object.fromEntries(campaign.map((item, index) => {
                let territoryArray = item['value'].split('\n')

                return [item.parentElement.children[0]['innerHTML'], territoryArray]
                }).filter(i => i))

                return layout
            }
        })
    }
}