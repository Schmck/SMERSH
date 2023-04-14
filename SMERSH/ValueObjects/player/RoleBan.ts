import { Field } from "../../Utilities";

export class RoleBan {
    @Field('integer')
    public Teams: Array<number>;

    @Field('text')
    public Sides: Array<string>;
}