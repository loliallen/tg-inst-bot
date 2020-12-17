import Telebot from "telebot"
import UserModel, { User } from "../../models/UserModel";
import InstagramBot from "./instagram";
import { isDocument } from "@typegoose/typegoose"
import StepModel, { Step } from "../../models/StepModel";
import path from "path"
import fs from "fs"

export default class TelegramBot {
    bot: Telebot;
    iBot: InstagramBot;
    token: string;

    constructor(iBot: InstagramBot) {
        this.token = process.env.TELEGRAM_BOT_TOKEN || "";
        this.bot = new Telebot({
            token: this.token,
            usePlugins: ['askUser', 'ignoreMessagesBeforeStart']
        })
        this.iBot = iBot
    }
    run() {

        this.start()
        this.instLoginStep()
        this.bot.start()
        console.log('[Telegram bot]: ✅ Started')
    }
    private start() {
        this.bot.on(['/start'], async (msg) => {
            try {
                const step = await StepModel.findById(process.env.STEP_ID)
                const _user = await UserModel.findOne({ tg_id: msg.from.id })
                if(_user)
                    return
                const user = new UserModel({
                    tg_id: msg.from.id,
                    step: process.env.STEP_ID
                })
                if (step) {
                    this.sendStep(user, step)
                    await user.save()
                    return
                }
                return this.bot.sendMessage(msg.from.id, "## Опа, адажи ", { parseMode: "markdown" })
            } catch (error) {
                console.error(error)
                return this.bot.sendMessage(msg.from.id, "Опа, адажи ", { parseMode: "markdown" })
            }
        })
    }
    private instLoginStep() {
        this.bot.on('text', async (msg) => {
            if (msg.entities && msg.entities.length > -1)
                return
            try {
                const user = await UserModel.findOne({ tg_id: msg.from.id }).populate({
                    path: "step",
                    populate: {
                        path: "next"
                    }
                })
                if (!user) {
                    return this.bot.sendMessage(msg.from.id, "Используй комманду /start", { parseMode: "markdown" })
                }
                // приходит логин от инсты
                if (!user.inst_login) {
                    // проверка подписки
                    this.bot.sendMessage(msg.from.id, "Проверка займет максимум минутку\nОжидайте... ⌛", { parseMode: "markdown" })
                    const index = await this.iBot.isFollowed(msg.text.toLowerCase())
                    if (index && isDocument(user.step)) {
                        await user.updateOne({ $set: { inst_login: msg.text, step: user.step.next } })
                        const nextStep = user.step.next
                        if (isDocument(nextStep))
                            return this.sendStep(user, nextStep)
                    }
                    else if (isDocument(user.step))
                        return this.sendStep(user, user.step, true)
                }

            } catch (error) {
                console.error(error)
                return this.bot.sendMessage(msg.from.id, "-Опа, адажи-", { parseMode: "markdown" })
            }
        })
    }
    private sendStep(user: User, step: Step, error: boolean = false): void {
        switch (step.attach_type) {
            case "file":
                this.bot.sendMessage(user.tg_id, step.message, { parseMode: "markdown" })
                return this.bot.sendDocument(user.tg_id, path.resolve(__dirname, "../../../public", step.attach_file))
            default:
                if (error)
                    return this.bot.sendMessage(user.tg_id, step.error_message, { parseMode: "markdown" })
                return this.bot.sendMessage(user.tg_id, step.message, { parseMode: "markdown" })
        }
    }
}