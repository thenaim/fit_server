const DATABASE = require('../db');

/**
 * Telegram bot module
 */
const TelegramBot = require('node-telegram-bot-api');
const Agent = require('socks5-https-client/lib/Agent');
let options = {
    polling: false
};

const tg = new TelegramBot(process.env.TG_TOKEN, options);

tg.onText(new RegExp(`/start`), (msg) => {
    const chatId = msg.chat.id;
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE tgId = ?`).get(chatId);

    if (stingray) {
        return tg.sendMessage(chatId, `Приложение уже интегрирован.\n\nID: ${stingray.id}\n\nПопробуйте отправить из приложения ${process.env.APP_NAME} упражнения или рецепты.\n\nPS: Чтобы остановить интеграцию нажмите на кнопку: Остановить.`, {
            "reply_markup": {
                "keyboard": [
                    ["Остановить"]
                ]
            }
        });
    }
    tg.sendMessage(chatId, "Нажмите на кнопку, чтобы начать интегрировать наше приложение в вашей приставке", {
        "reply_markup": {
            "keyboard": [
                [`Интеграция с приложением ${process.env.APP_NAME}`]
            ]
        }
    });

});

tg.onText(new RegExp(`Интеграция с приложением ${process.env.APP_NAME}`), (msg) => {
    const chatId = msg.chat.id;
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE tgId = ?`).get(chatId);

    if (stingray) {
        return tg.sendMessage(chatId, `Приложение уже интегрирован.\n\nID: ${stingray.id}\n\nПопробуйте отправить из приложения ${process.env.APP_NAME} упражнения или рецепты.\n\nPS: Чтобы остановить интеграцию нажмите на кнопку: Остановить.`, {
            "reply_markup": {
                "keyboard": [
                    ["Остановить"]
                ]
            }
        });
    }
    tg.sendMessage(chatId, `Отправьте сюда ID приложения ${process.env.APP_NAME} в вашей приставке. В настройках приложении.\n\nПример: 12345678`, {
        "reply_markup": {
            "keyboard": [
                [`Интеграция с приложением ${process.env.APP_NAME}`]
            ]
        }
    });
});

tg.onText(/^[0-9]{8,}/, (msg) => {
    const chatId = msg.chat.id;
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE tgId = ?`).get(chatId);

    if (stingray) {
        return tg.sendMessage(chatId, `Приложение уже интегрирован.\n\nID: ${stingray.id}\n\nПопробуйте отправить из приложения ${process.env.APP_NAME} упражнения или рецепты.\n\nPS: Чтобы остановить интеграцию нажмите на кнопку: Остановить.`, {
            "reply_markup": {
                "keyboard": [
                    ["Остановить"]
                ]
            }
        });
    }

    stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(msg.text);
    if (stingray) {
        const stingrayUpdate = DATABASE.stingray.prepare(`UPDATE stingray SET tgId = @tgId, tgIntegrated = @tgIntegrated WHERE id = @id`);
        stingrayUpdate.run({
            tgId: +chatId,
            tgIntegrated: 1,
            id: stingray.id
        });
        return tg.sendMessage(chatId, `Успешно интегрирован.\n\nID: ${msg.text}\n\nПопробуйте отправить из приложения ${process.env.APP_NAME} упражнения или рецепты.`, {
            "reply_markup": {
                "keyboard": [
                    ["Остановить"]
                ]
            }
        });
    }
    tg.sendMessage(chatId, `ID приложения не найдено(. Попробуйте ещё раз.`, {
        "reply_markup": {
            "keyboard": [
                [`Интеграция с приложением ${process.env.APP_NAME}`]
            ]
        }
    });
});

tg.onText(/\Остановить/, (msg) => {
    const chatId = msg.chat.id;
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE tgId = ?`).get(chatId);

    if (stingray) {
        const stingrayUpdate = DATABASE.stingray.prepare(`UPDATE stingray SET tgId = @tgId, tgIntegrated = @tgIntegrated WHERE id = @id`);
        stingrayUpdate.run({
            tgId: null,
            tgIntegrated: 0,
            id: stingray.id
        });
        return tg.sendMessage(chatId, "Интеграция с приложением остановлен.", {
            "reply_markup": {
                "keyboard": [
                    [`Интеграция с приложением ${process.env.APP_NAME}`]
                ]
            }
        });
    }
    tg.sendMessage(chatId, `Отправьте сюда ID приложения ${process.env.APP_NAME} в вашей приставке. В настройках приложении.\n\nПример: 12345678`, {
        "reply_markup": {
            "keyboard": [
                [`Интеграция с приложением ${process.env.APP_NAME}`]
            ]
        }
    });
});

tg.startPolling().then(() => {
    console.log(`${process.env.APP_NAME} is integrated with TG BOT ${process.env.TG_BOT} or search ${process.env.SHORT}`);
});

/**
 * Telegram bot init function
 */
exports.tgInit = () => {
    return tg;
};