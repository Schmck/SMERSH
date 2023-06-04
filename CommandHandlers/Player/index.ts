import { RegisterPlayerCommandHandler } from './RegisterPlayerCommandHandler'
import { ChangePlayerNameCommandHandler } from './ChangePlayerNameCommandHandler'
import { ApplyPolicyCommandHandler } from './ApplyPolicyCommandHandler'
import { LiftBanCommandHandler } from './LiftBanCommandHandler'
import { ApplyRoleBanCommandHandler } from './ApplyRoleBanCommandHandler'
import { LiftRoleBanCommandHandler } from './LiftRoleBanCommandHandler'
import { LiftMuteCommandHandler } from './LiftMuteCommandHandler'
import { ApplyDiscordRoleCommandHandler } from './ApplyDiscordRoleCommandHandler'
import { ChangePlayerIpAddressCommandHandler } from './ChangePlayerIpAddressCommandHandler'


export const PlayerCommandHandlers = [
    RegisterPlayerCommandHandler,
    ChangePlayerNameCommandHandler,
    ApplyPolicyCommandHandler,
    LiftBanCommandHandler,
    ApplyRoleBanCommandHandler,
    LiftRoleBanCommandHandler,
    LiftMuteCommandHandler,
    ApplyDiscordRoleCommandHandler,
    ChangePlayerIpAddressCommandHandler
]