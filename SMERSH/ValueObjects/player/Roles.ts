import { Enumeration } from '../'

export class Roles extends Enumeration {
    private constructor(value: number, displayName: string) {
        super(value, displayName)
    }

    public Rifleman: Roles = new Roles(0, "Rifleman")

    public EliteRifleman: Roles = new Roles(1, "Elite Rifleman")

    public Assault: Roles = new Roles(2, "Assault")

    public EliteAssault: Roles = new Roles(2, "Elite Assault")

    public MachineGunner: Roles = new Roles(2, "Machine Gunner")

    public Engineer: Roles = new Roles(2, "Engineer")

    public SquadLeader: Roles = new Roles(2, "Squad Leader")

    public Commander: Roles = new Roles(2, "Team Leader")

    public Marksman: Roles = new Roles(2, "Marksman")

}