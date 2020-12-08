import { prop, getModelForClass, Ref } from "@typegoose/typegoose"

export class Step {
    @prop({ required: true })
    public message!: string;
    @prop({ required: true })
    public error_message!: string;
    @prop({ required: false })
    public attach_type!: string;
    @prop({ required: false })
    public attach_file!: string;
    @prop({ autopopulate: true, required: false, ref: () => Step })
    public next!: Ref<Step>;
}
const StepModel = getModelForClass(Step)
export default StepModel