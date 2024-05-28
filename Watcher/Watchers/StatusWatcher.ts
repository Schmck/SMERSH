import { Watcher } from '../Watcher'
import { StatusQuery } from '../../Services/WebAdmin/Queries'

export class StatusWatcher extends Watcher {

    public override async Watch(timeout = 1000, ...args: any[]) {
        const status = await StatusQuery.Get();
        global.state = status;

        setTimeout(() => {
            this.Watch(timeout)
        }, timeout)
    }
}