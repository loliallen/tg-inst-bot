import Telebot from "telebot"
import InstagramBot from "./instagram";

export default class TelegramBot {
    bot: Telebot;
    iBot: InstagramBot;
    token: string;
    welcomeMessage: string = `
    Привет это бот для Игоряна\nВведите команду /login, и следуйте инструкциям чтобы мы смогли проверить подписаны ли вы на [thatsnoisy](vk.com)
    `
    constructor(iBot: InstagramBot) {
        this.token = process.env.TELEGRAM_BOT_TOKEN || "";
        this.bot = new Telebot({
            token: this.token,
            usePlugins: ['askUser', 'ignoreMessagesBeforeStart']
        })
        this.iBot = iBot
    }
    run() {
        this.bot.on(['/start'], (msg) => {
            console.log(msg)
            return this.bot.sendMessage(msg.from.id, this.welcomeMessage, { parseMode: "markdown" })
        })
        this.bot.on(['/login'], (msg) => {
            this.bot.sendMessage(msg.from.id, 'Введите ваш ник в инстаграме')
            return this.bot.on('text', async (msg) => {
                const index = await this.iBot.isFollowed(msg.text)
                if (index > -1)
                    return this.bot.sendMessage(msg.from.id, "hello")
                else
                    return this.bot.sendMessage(msg.from.id, "go away")
            })
        })
        this.bot.start()
        console.log('telegram bot started...')
    }
}