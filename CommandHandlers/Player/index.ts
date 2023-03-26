import { RegisterPlayerCommandHandler } from './RegisterPlayerCommandHandler'
import { ChangePlayerNameCommandHandler } from './ChangePlayerNameCommandHandler'
import { ApplyPolicyCommandHandler } from './ApplyPolicyCommandHandler'
import { LiftBanCommandHandler } from './LiftBanCommandHandler'


export const PlayerCommandHandlers = [
    RegisterPlayerCommandHandler,
    ChangePlayerNameCommandHandler,
    ApplyPolicyCommandHandler,
    LiftBanCommandHandler
]