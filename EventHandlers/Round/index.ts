import { ChatLinesReceivedEventHandler } from './ChatLinesReceivedEventHandler'
import { RoundStartedEventHandler } from './RoundStartedEventHandler'
import { RoundEndedEventHandler } from './RoundEndedEventHandler'

export const RoundEventHandlers = [
    ChatLinesReceivedEventHandler,
    RoundStartedEventHandler,
    RoundEndedEventHandler
]