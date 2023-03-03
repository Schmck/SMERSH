import { RoundCommandHandlers } from './Round'
import { PlayerCommandHandlers } from './Player'

export const CommandHandlers =  [
    ...RoundCommandHandlers,
    ...PlayerCommandHandlers,
]