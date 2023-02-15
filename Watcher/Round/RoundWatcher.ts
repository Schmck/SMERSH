import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { ReceiveChatLinesCommand } from '../../Commands/Round'
import { StatusQuery } from '../../Services/WebAdmin/Queries'
import { Guid } from 'guid-typescript'
import { Team } from '../../SMERSH/ValueObjects'

export class RoundWatcher extends Watcher {

    public override async Watch(timeout = 1000, ...args : any[]) {
        const session = WebAdminSession.get();

        const status = await StatusQuery.Get();
        let mapTime = args['status'] && args['status'].rules && args['status'].rules['timeLeft'] ? args['status'].rules['timeLeft'] : 0
        let newMapTime = status && status.rules && status.rules['timeLeft'] ? status.rules['timeLeft'] : 0

        if(!newMapTime || (newMapTime === mapTime))

        setTimeout(() => {
            this.Watch(timeout, [...args, status])
        }, timeout)
    }
}