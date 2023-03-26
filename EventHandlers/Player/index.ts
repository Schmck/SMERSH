import { PlayerRegisteredEventHandler } from './PlayerRegisteredEventHandler'
import { PlayerNameChangedEventHandler } from './PlayerNameChangedEventHandler'
import { PolicyAppliedEventHandler } from './PolicyAppliedEventHandler'
import { BanLiftedEventHandler } from './BanLiftedEventHandler'


export const PlayerEventHandlers = [
    PlayerRegisteredEventHandler,
    PlayerNameChangedEventHandler,
    PolicyAppliedEventHandler,
    BanLiftedEventHandler
]