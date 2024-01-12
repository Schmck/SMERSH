import { StoreEventHandler } from './StoreEventHandler'
import { MapEventHandlers } from './Map'
import { RoundEventHandlers } from './Round'
import { PlayerEventHandlers } from './Player'
import { LayoutEventHandlers } from './Layout'

export const EventHandlers = [
    StoreEventHandler,
    ...RoundEventHandlers,
    ...PlayerEventHandlers,
    ...LayoutEventHandlers,
    ...MapEventHandlers,
]