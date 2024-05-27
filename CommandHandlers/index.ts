import { RoundCommandHandlers } from './Round'
import { PlayerCommandHandlers } from './Player'
import { LayoutCommandHandlers } from './Layout'
import { MapCommandHandlers } from './Map'

export const CommandHandlers =  [
    ...RoundCommandHandlers,
    ...PlayerCommandHandlers,
    ...LayoutCommandHandlers,
    ...MapCommandHandlers,
]