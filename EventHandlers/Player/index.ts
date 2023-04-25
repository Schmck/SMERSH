import { PlayerRegisteredEventHandler } from './PlayerRegisteredEventHandler'
import { PlayerNameChangedEventHandler } from './PlayerNameChangedEventHandler'
import { PolicyAppliedEventHandler } from './PolicyAppliedEventHandler'
import { BanLiftedEventHandler } from './BanLiftedEventHandler'
import { RoleBanAppliedEventHandler } from './RoleBanAppliedEventHandler'
import { RoleBanLiftedEventHandler } from './RoleBanLiftedEventHandler'
import { MuteLiftedEventHandler } from './MuteLiftedEventHandler'
import { DiscordRoleAppliedEventHandler } from './DiscordRoleAppliedEventHandler'


export const PlayerEventHandlers = [
    PlayerRegisteredEventHandler,
    PlayerNameChangedEventHandler,
    PolicyAppliedEventHandler,
    BanLiftedEventHandler,
    RoleBanAppliedEventHandler,
    RoleBanLiftedEventHandler,
    MuteLiftedEventHandler,
    DiscordRoleAppliedEventHandler
]