import { NewPlayerRegisteredEvent, RoundStartedEvent } from "../../Events"

export class PlayerEventHandler
    implements IHandleEvent<NewPlayerRegisteredEvent>,
    IHandleEvent<NewPlayerRegisteredEvent>	{

    Handle(event: NewPlayerRegisteredEvent) {

    }

	}