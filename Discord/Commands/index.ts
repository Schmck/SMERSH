import { Command } from "../Framework/Command"
import { LookupCommand } from './LookupCommand'
import { TempbanCommand } from './TempbanCommand'
import { KickCommand } from './KickCommand'
import { ChatLogCommand } from './ChatLogCommand'
import { SaveLayoutCommand } from './SaveLayoutCommand'
import { RoleBanCommand } from './RoleBanCommand'
import { RoleBansCommand } from './RoleBansCommand'
export const Commands: Command[] = [LookupCommand, TempbanCommand, KickCommand, ChatLogCommand, SaveLayoutCommand, RoleBanCommand, RoleBansCommand];