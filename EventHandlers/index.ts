import { StoreEventHandler } from './StoreEventHandler'

import { RoundEventHandlers } from './Round'
import { PlayerEventHandlers } from './Player'
import { LayoutEventHandlers } from './Layout'

export const EventHandlers = [
    StoreEventHandler,
    ...RoundEventHandlers,
    ...PlayerEventHandlers,
    ...LayoutEventHandlers,
]