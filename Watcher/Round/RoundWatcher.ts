import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { StartRoundCommand, EndRoundCommand  } from '../../Commands/Round'
import { StatusQuery } from '../../Services/WebAdmin/Queries'
import { Guid } from 'guid-typescript'
import { Team } from '../../SMERSH/ValueObjects'

export class RoundWatcher extends Watcher {

    public override async Watch(timeout = 1000, ...args: any[]) {
        const status = await StatusQuery.Get();
        const oldStatus = args[0] && args[0]['status'];
        const playerIds = status && status.players ? status.players.map(player => player.Id) : []

        let oldMapTime = args[0] && args[0]['mapTime']
        let mapTime = oldStatus && oldStatus.rules && oldStatus.rules.TimeLeft ? oldStatus.rules.TimeLeft : 0
        let newMapTime = status && status.rules && status.rules['TimeLeft'] ? status.rules['TimeLeft'] : 0

        let oldMap = oldStatus && oldStatus.game && oldStatus.game.Map;
        let newMap = status && status.game && status.game['Map']


        if (newMapTime === mapTime && mapTime !== oldMapTime) {
             this.commandBus.execute(new EndRoundCommand(Guid.createEmpty(), Guid.createEmpty(), new Date(), playerIds))
        }

        if (oldMap && oldMap.length !== 0 && oldMap !== newMap) {
            
            this.commandBus.execute(new StartRoundCommand(Guid.create(), Guid.createEmpty(), new Date(), playerIds))
        }

        setTimeout(() => {
            this.Watch(timeout, { status, mapTime })
        }, timeout)
    }
}