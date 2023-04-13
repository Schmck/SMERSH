import { Status } from '../../Services/WebAdmin/Models'
import { StatusQuery } from '../../Services/WebAdmin/Queries';
import { Watcher } from '../Watcher'

export class LayoutWatcher extends Watcher {


    public override async Watch(timeout = 60000, ...args: Array<{ status: Status }>) {
        const status = await StatusQuery.Get();
        const prevStatus = args[0] && args[0].status;



        setTimeout(() => {
            this.Watch(timeout, { status: status ?? prevStatus })
        }, timeout)
    }
}