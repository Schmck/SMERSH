import { RoundEventHandlers } from './Round'
import { PlayerEventHandlers } from './Player'
import { StoreEventHandler } from './StoreEventHandler'

export const EventHandlers = [
    StoreEventHandler,
    ...RoundEventHandlers,
    ...PlayerEventHandlers,
]