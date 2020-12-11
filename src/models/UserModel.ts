import { getModelForClass, prop, Ref } from "@typegoose/typegoose"
import { Step } from "./StepModel";

export class User {
    @prop({ 
        required: true, 
        unique: true
    })
    public tg_id!: string;

    @prop({ ref: () => Step })
    public step!: Ref<Step>;

    @prop({ required: false })
    public inst_login?: string;
}

const UserModel = getModelForClass(User)
export default UserModel