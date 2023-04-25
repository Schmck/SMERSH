import { Command } from './Command'
import { LookupCommand } from './LookupCommand'
import { TempbanCommand } from './TempbanCommand'
import { UnBanCommand } from './UnBanCommand'
import { KickCommand } from './KickCommand'
import { MuteCommand } from './MuteCommand'
import { UnMuteCommand } from './UnMuteCommand'


export const Commands: Command[] = [LookupCommand, TempbanCommand, UnBanCommand, KickCommand, MuteCommand, UnMuteCommand];