import { ReceiveChatLinesCommandHandler } from './ReceiveChatLinesCommandHandler'
import { StartRoundCommandHandler } from './StartRoundCommandHandler'
import { EndRoundCommandHandler } from './EndRoundCommandHandler'
import { ChangeMapCommandHandler } from './ChangeMapCommandHandler'
import { UpdatePlayerRoundCommandHandler } from './PlayerRound'

export const RoundCommandHandlers = [
    ReceiveChatLinesCommandHandler,
    StartRoundCommandHandler,
    EndRoundCommandHandler,
    ChangeMapCommandHandler,
    UpdatePlayerRoundCommandHandler
]