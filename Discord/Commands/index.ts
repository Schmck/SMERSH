import { Command } from "../Framework/Command"
import { LookupCommand } from './LookupCommand'
import { KickCommand } from './KickCommand'
import { TempbanCommand } from './TempbanCommand'
import { UnBanCommand } from './UnBanCommand'
import { RoleBanCommand } from './RoleBanCommand'
import { RoleBansCommand } from './RoleBansCommand'
import { UnRoleBanCommand } from './UnRoleBanCommand'
import { MuteCommand } from './MuteCommand'
import { UnMuteCommand } from './UnMuteCommand'
import { ChatLogCommand } from './ChatLogCommand'
import { SaveLayoutCommand } from './SaveLayoutCommand'
import { StatsCommand } from './StatsCommand'
import { RankingsCommand } from './RankingsCommand'
import { RoleCommand } from './RoleCommand'
import { HelpCommand } from './HelpCommand'
export const Commands: Command[] = [
    LookupCommand,
    KickCommand,
    TempbanCommand,
    UnBanCommand,
    RoleBanCommand,
    UnRoleBanCommand,
    RoleBansCommand,
    MuteCommand,
    UnMuteCommand,
    ChatLogCommand,
    SaveLayoutCommand,
    StatsCommand,
    RankingsCommand,
    RoleCommand,
    HelpCommand
];