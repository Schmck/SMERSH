import { ReceiveChatLinesCommandHandler, StartRoundCommandHandler, EndRoundCommandHandler, ChangeMapCommandHandler } from './Round'

export const CommandHandlers =  [
    ReceiveChatLinesCommandHandler,
    ChangeMapCommandHandler,
    StartRoundCommandHandler,
    EndRoundCommandHandler,
]