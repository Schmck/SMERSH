import { Enumeration } from '../'

export class Role extends Enumeration {
    private constructor(value: number, displayName: string) {
        super(value, displayName)
    }

    public static Rifleman: Role = new Role(0, "RIFLEMAN")

    public static EliteRifleman: Role = new Role(1, "ELITE RIFLEMAN")

    public static Assault: Role = new Role(2, "ASSAULT")

    public static EliteAssault: Role = new Role(3, "ELITE ASSAULT")

    public static MachineGunner: Role = new Role(4, "MACHINE GUNNER")

    public static Engineer: Role = new Role(5, "ENGINEER")

    public static SquadLeader: Role = new Role(6, "SQUAD LEADER")

    public static Commander: Role = new Role(7, "COMMANDER")

    public static Marksman: Role = new Role(8, "MARKSMAN")

    public static TankCommander: Role = new Role(9, "TANK COMMANDER")

    public static AntiTank: Role = new Role(10, "ANTI-TANK SOLDIER")

}