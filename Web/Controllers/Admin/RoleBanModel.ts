export class RoleBanModel {
    public Players: Record<string, {
        aliases: Array<string>,
        roles: Array<string>,
        teams: Array<string>,
        sides: Array<string>,
        channelId: string,
        id: string,
    }>
}