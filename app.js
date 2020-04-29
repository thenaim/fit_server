/**
 * Module dependencies.
 */
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const adapter = new FileAsync('./assets/DB/db.json');

const fs = require('fs');

/**
 * VK bot module
 */
const VkBot = require('node-vk-bot-api');
const vk = new VkBot(process.env.VK_TOKEN);
const vkApi = require('node-vk-bot-api/lib/api');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const Scene = require('node-vk-bot-api/lib/scene');
const Markup = require('node-vk-bot-api/lib/markup');
const session = new Session();

/**
 * Telegram bot module
 */
const TelegramBot = require('node-telegram-bot-api');
const Agent = require('socks5-https-client/lib/Agent');
const tg = new TelegramBot(process.env.TG_TOKEN, {
    polling: false,
    request: {
        agentClass: Agent,
        agentOptions: {
            socksHost: process.env.socksHost,
            socksPort: process.env.socksPort,
            // If authorization is needed:
            socksUsername: process.env.socksUsername,
            socksPassword: process.env.socksPassword
        }
    }
});

/**
 * Express configuration.
 */
app.use(cors());
app.set("view engine", "ejs");
app.use('/static', express.static(__dirname + '/public'));
app.use('/videos', express.static(__dirname + '/public/videos'));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.vk = vk;
    res.tg = tg;

    low(adapter).then((db) => {
        res.db = db;
        next();
    });
});

/**
 * Controllers (route handlers).
 */
const stingrayController = require('./controllers/stingray');
const bookmarkController = require('./controllers/bookmark');
const exercisesController = require('./controllers/exercises');
const nutritionController = require('./controllers/nutrition');
const settingsController = require('./controllers/settings');
const videoController = require('./controllers/video');
const socialController = require('./controllers/social');
const statsController = require('./controllers/stats');

/**
 * API key middleware.
 */
const passportConfig = require('./config/passport');

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/stingray', passportConfig.authTokenValidator, stingrayController.getKeys);
app.get('/save', passportConfig.authTokenValidator, videoController.saveVideo);
app.get('/videos', passportConfig.authTokenValidator, videoController.getVideos);
app.get('/bookmarks', passportConfig.authTokenValidator, bookmarkController.getBookmarks);
app.get('/bookmarks/addDelete', passportConfig.authTokenValidator, bookmarkController.addDeleteBookmarks);
app.get('/exercises', passportConfig.authTokenValidator, exercisesController.getExercises);
app.get('/exercise/categories', passportConfig.authTokenValidator, exercisesController.getExercisesCategories);
app.get('/nutritions', passportConfig.authTokenValidator, nutritionController.getNutritions);
app.get('/social/send', passportConfig.authTokenValidator, socialController.sendSocial);
app.get('/settings', passportConfig.authTokenValidator, settingsController.getSettings);
app.get('/settings/themechange', passportConfig.authTokenValidator, settingsController.themeChange);
app.get('/stats', passportConfig.authTokenValidator, statsController.addStats);
app.get('/settings/update/stingray', passportConfig.authTokenValidator, settingsController.updateStingray);

/**
 * VK bot init
 */
function vkInit() {
    const scene = new Scene('integrate',
        (ctx) => {
            ctx.scene.next();
            ctx.reply(`Отправьте сюда ID приложения fitSmart в вашей приставке. В настройках приложении.\n\nПример: ABCDEF`, null, Markup.keyboard([
                'Интеграция с приложением fitSmart'
            ]));
        },
        (ctx) => {
            ctx.session.id = ctx.message.text;
            ctx.scene.leave();

            // load DB
            low(adapter).then((db) => {
                const stingray = db.get('stingrays').find({
                    id: ctx.session.id
                }).value();

                if (!stingray) return ctx.reply('ID приложения не найдено(');

                db.get('stingrays').find({
                    id: ctx.session.id
                }).assign({
                    vkId: ctx.message.from_id,
                    vkIntegrated: true
                }).write();

                ctx.reply(`Успешно интегрирован.\n\nID: ${ctx.session.id}`, null, Markup.keyboard([
                    'Интеграция с приложением fitSmart',
                    'Остановить'
                ]));
            });
        });

    const stage = new Stage(scene);
    vk.use(session.middleware());
    vk.use(stage.middleware());

    vk.command('Интеграция с приложением fitSmart', (ctx) => {
        // load DB
        low(adapter).then((db) => {
            // get stingrays
            const stingray = db.get('stingrays').find({
                vkId: ctx.message.from_id
            }).value();

            if (!stingray) return ctx.scene.enter('integrate');

            ctx.reply(`Приложение уже интегрирован.\n\nID: ${stingray.id}\n\nPS: Чтобы остановить интеграцию нажмите на кнопку: Остановить.`, null, Markup.keyboard([
                'Остановить'
            ]));

        });
    });

    vk.command('Остановить', (ctx) => {
        // load DB
        low(adapter).then((db) => {
            // get stingrays
            const stingray = db.get('stingrays').find({
                vkId: ctx.message.from_id
            }).value();

            if (!stingray) return ctx.scene.enter('integrate');

            db.get('stingrays').find({
                vkId: ctx.message.from_id
            }).assign({
                vkId: "",
                vkIntegrated: false
            }).write();

            ctx.reply(`Интеграция с приложением остановлен.`, null, Markup.keyboard([
                'Интеграция с приложением fitSmart'
            ]));

        });
    });

    vk.on((ctx) => {
        ctx.reply('Нажмите на кнопку, чтобы начать интегрировать наше приложение в вашей приставке', null, Markup.keyboard([
            'Интеграция с приложением fitSmart'
        ]));
    });

    vk.startPolling(() => {
        console.log(`FitSmart is integrated with VK BOT ${process.env.VK_BOT} or search ${process.env.SHORT}`);
    });
}

/**
 * Telegram bot init
 */
function tgInit() {
    tg.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        console.log(chatId);

        // load DB
        low(adapter).then((db) => {
            // get stingrays
            const stingray = db.get('stingrays').find({
                tgId: chatId
            }).value();

            if (!stingray || !stingray.tgIntegrated) {
                return tg.sendMessage(chatId, "Нажмите на кнопку, чтобы начать интегрировать наше приложение в вашей приставке", {
                    "reply_markup": {
                        "keyboard": [
                            ["Интеграция с приложением fitSmart"]
                        ]
                    }
                });
            }

            tg.sendMessage(chatId, `Приложение уже интегрирован.\n\nID: ${stingray.id}\n\nPS: Чтобы остановить интеграцию нажмите на кнопку: Остановить.`, {
                "reply_markup": {
                    "keyboard": [
                        ["Интеграция с приложением fitSmart"],
                        ["Остановить"]
                    ]
                }
            });
        });
    });

    tg.onText(/\Интеграция с приложением fitSmart/, (msg) => {
        const chatId = msg.chat.id;
        // load DB
        low(adapter).then((db) => {
            const stingray = db.get('stingrays').find({
                tgId: chatId
            }).value();

            if (!stingray || !stingray.tgIntegrated) {
                return tg.sendMessage(chatId, `Отправьте сюда ID приложения fitSmart в вашей приставке. В настройках приложении.\n\nПример: ABCDEF`, {
                    "reply_markup": {
                        "keyboard": [
                            ["Интеграция с приложением fitSmart"]
                        ]
                    }
                });
            }
            tg.sendMessage(chatId, `Приложение уже интегрирован.\n\nID: ${stingray.id}\n\nPS: Чтобы остановить интеграцию нажмите на кнопку: Остановить.`, {
                "reply_markup": {
                    "keyboard": [
                        ["Интеграция с приложением fitSmart"],
                        ["Остановить"]
                    ]
                }
            });
        });
    });

    tg.onText(/^[0-9A-Z]{6,6}/, (msg) => {
        const chatId = msg.chat.id;
        // load DB
        low(adapter).then((db) => {
            let stingray = db.get('stingrays').find({
                tgId: chatId
            }).value();

            if (stingray && stingray.tgIntegrated) {
                return tg.sendMessage(chatId, `Отправьте сюда ID приложения fitSmart в вашей приставке. В настройках приложении.\n\nПример: ABCDEF`, {
                    "reply_markup": {
                        "keyboard": [
                            ["Интеграция с приложением fitSmart"]
                        ]
                    }
                });
            }

            stingray = db.get('stingrays').find({
                id: msg.text
            }).value();

            if (!stingray) {
                return tg.sendMessage(chatId, `ID приложения не найдено(. Попробуйте ещё раз.`, {
                    "reply_markup": {
                        "keyboard": [
                            ["Интеграция с приложением fitSmart"]
                        ]
                    }
                });
            }

            db.get('stingrays').find({
                id: msg.text
            }).assign({
                tgId: chatId,
                tgIntegrated: true
            }).write();

            tg.sendMessage(chatId, `Успешно интегрирован.\n\nID: ${msg.text}`, {
                "reply_markup": {
                    "keyboard": [
                        ["Интеграция с приложением fitSmart"],
                        ["Остановить"]
                    ]
                }
            });
        });
    });

    tg.onText(/\Остановить/, (msg) => {
        const chatId = msg.chat.id;
        // load DB
        low(adapter).then((db) => {
            // get stingrays
            const stingray = db.get('stingrays').find({
                tgId: chatId
            }).value();

            if (!stingray) {
                tg.sendMessage(chatId, `Отправьте сюда ID приложения fitSmart в вашей приставке. В настройках приложении.\n\nПример: ABCDEF`, {
                    "reply_markup": {
                        "keyboard": [
                            ["Интеграция с приложением fitSmart"]
                        ]
                    }
                });
                return;
            }

            db.get('stingrays').find({
                tgId: chatId
            }).assign({
                tgId: "",
                tgIntegrated: false
            }).write();

            tg.sendMessage(chatId, "Интеграция с приложением остановлен.", {
                "reply_markup": {
                    "keyboard": [
                        ["Интеграция с приложением fitSmart"]
                    ]
                }
            });
        });
    });

    tg.startPolling().then(() => {
        console.log(`FitSmart is integrated with TG BOT ${process.env.TG_BOT} or search ${process.env.SHORT}`);
    });
}

/**
 * Start Nodejs Express server.
 */
app.listen(process.env.PORT, process.env.IPV4, () => {
    console.log(`FitSmart server is running at http://${process.env.IPV4}:${process.env.PORT}`);

    // After run server, run vk bot and telegram bot
    vkInit();
    tgInit();
});

/**
 * On server kill
 * clear DB (old values)
 */
process.on('SIGINT', function () {
    low(adapter).then((db) => {
        db.set('stingrays', []).write().then(() => {
            db.set('bookmarks', []).write().then(() => {
                process.exit();
            });
        });
    });
});