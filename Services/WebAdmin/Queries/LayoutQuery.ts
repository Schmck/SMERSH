import { WebAdminSession } from '..';
import { Parsers } from "../../../Web/Utils";
import { Query } from './Query';
import { LayoutRoute } from '../../WebAdmin/Routes';

export class LayoutQuery extends Query {

    public static async Get() {
        const session = WebAdminSession.get();
        const dom = await session.navigate(LayoutRoute.GetLayout.Action)

        const campaign = Object.values(dom.window.document.querySelectorAll(`[id^='tcontainer_sg']`))
        const layout: Record<string, string[]> = Object.fromEntries(Array.from(campaign).map(item => {
            let key = item.querySelector('legend').innerText
            let value = item.querySelector('textarea').innerText.split('\n')

            return [key, value]
        }, {}))

        return layout
    }
}