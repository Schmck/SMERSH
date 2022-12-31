import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { ReceiveChatLineCommand } from '../../Commands/Current'
import { Guid } from 'guid-typescript'
import { Team } from '../../SMERSH/ValueObjects'

export class RoundWatcher extends Watcher {

    public override Watch(timeout = 1000) {

    }
}