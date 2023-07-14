
export class Message {
    constructor(id: string, username: string, message: string, visibility: string, team: string, timestamp: string) {

        this.id = id;
        this.username = username;
        this.message = message;
        this.visibility = visibility;
        this.team = team;
        this.timestamp = timestamp;
    }

    public id: string;

    public username: string;

    public message: string;

    public visibility: string;

    public team: string;

    public timestamp: string;
}