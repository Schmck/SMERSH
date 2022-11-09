import { Route } from '../'

export class ChatRoute extends Route {
    private constructor(method: string, action: string) {
        super(method, action)
    }

    public static GetChat: ChatRoute = new ChatRoute('GET', "/current/chat")

    public static PostChat: ChatRoute = new ChatRoute('POST', "/current/chat/data")
}