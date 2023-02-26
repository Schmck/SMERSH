import { ChatLinesReceivedEventHandler } from './ChatLinesReceivedEventHandler'
import { RoundStartedEventHandler } from './RoundStartedEventHandler'
import { RoundEndedEventHandler } from './RoundEndedEventHandler'
import { MapChangedEventHandler } from './MapChangedEventHandler'

export const RoundEventHandlers = [
    ChatLinesReceivedEventHandler,
    MapChangedEventHandler,
    RoundStartedEventHandler,
    RoundEndedEventHandler
]