import { WebAdminSession } from '..';
import { Parsers } from "../../../Web/Utils";
import { Query } from './Query';
import { LayoutRoute } from '../../WebAdmin/Routes';

export class LayoutQuery extends Query {

    public static async Get() {
        const session = WebAdminSession.get();
        const dom = await session.navigate(LayoutRoute.GetLayout.Action)
        const env = JSON.parse(process.argv[process.argv.length - 1]);

        const suffix = env['GAME'] && env['GAME'] === 'RS1' ? 'pt' : 'sg'
        const campaign = Object.values(dom.window.document.querySelectorAll(`[id^='tcontainer_${suffix}']`))
        if (!campaign.length) {
            return null
        }
        const layout: Record<string, string[]> = Object.fromEntries(Array.from(campaign).map(item => {
            let key = item.querySelector('legend').textContent
            let values = item.querySelector('textarea');
            if (!values.textContent) {
                return [key, []]
            }
            let value = values && values.textContent && values.textContent.split('\n')

            return [key, value]
        }, {}))

        if (!Object.values(layout).every(lt => lt && lt.length)) {
            return null;
        }
        return layout
    }
}