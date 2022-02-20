import { Route } from '../'

class ChatRoute extends Route {
    private constructor(method: string, action: string) {
        super(method, action)
    }

    public GetChat: ChatRoute = new ChatRoute('GET', "/current/chat")

    public PostChat: ChatRoute = new ChatRoute('POST', "/current/chat/data")
}