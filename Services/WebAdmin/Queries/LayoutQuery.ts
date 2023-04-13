import { WebAdminSession } from '..';
import { Parsers } from "../../../Web/Utils";
import { Query } from './Query';
import { LayoutRoute } from '../../WebAdmin/Routes';

export class LayoutQuery extends Query {

    public static async Get() {
        const session = WebAdminSession.get();
        const dom = await session.navigate(LayoutRoute.GetLayout.Action)

        const campaign = Object.values(dom.window.document.querySelectorAll(`[id^='sgterritory_']`))
        const layout: Record<string, string[]> = Object.fromEntries(campaign.map((item, index) => {
            let territoryArray = item['value'].split('\n')

            return [item.parentElement.children[0]['innerHTML'], territoryArray]
        }).filter(i => i))

        return layout
    }
}