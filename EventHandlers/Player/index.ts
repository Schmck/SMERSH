import { PlayerRegisteredEventHandler } from './PlayerRegisteredEventHandler'
import { PlayerNameChangedEventHandler } from './PlayerNameChangedEventHandler'
import { PolicyAppliedEventHandler } from './PolicyAppliedEventHandler'
import { BanLiftedEventHandler } from './BanLiftedEventHandler'
import { RoleBanAppliedEventHandler } from './RoleBanAppliedEventHandler'
import { RoleBanLiftedEventHandler } from './RoleBanLiftedEventHandler'


export const PlayerEventHandlers = [
    PlayerRegisteredEventHandler,
    PlayerNameChangedEventHandler,
    PolicyAppliedEventHandler,
    BanLiftedEventHandler,
    RoleBanAppliedEventHandler,
    RoleBanLiftedEventHandler
]