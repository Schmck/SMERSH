import { RoundCommandHandlers } from './Round'
import { PlayerCommandHandlers } from './Player'
import { LayoutCommandHandlers } from './Layout'

export const CommandHandlers =  [
    ...RoundCommandHandlers,
    ...PlayerCommandHandlers,
    ...LayoutCommandHandlers,
]