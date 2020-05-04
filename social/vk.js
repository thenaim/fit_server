const DATABASE = require('../db');

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


const scene = new Scene('integrate',
    (ctx) => {
        ctx.scene.next();
        ctx.reply(`Отправьте сюда ID приложения fitSmart в вашей приставке. В настройках приложении.\n\nПример: 12345678`, null, Markup.keyboard([
            'Интеграция с приложением fitSmart'
        ]));
    },
    (ctx) => {
        ctx.session.id = ctx.message.text;
        ctx.scene.leave();

        const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(ctx.session.id);

        if (stingray) {
            const stingrayUpdate = DATABASE.stingray.prepare(`UPDATE stingray SET vkId = @vkId, vkIntegrated = @vkIntegrated WHERE id = @id`);
            stingrayUpdate.run({
                vkId: +ctx.message.from_id,
                vkIntegrated: 1,
                id: stingray.id
            });
            return ctx.reply(`Успешно интегрирован.\n\nID: ${stingray.id}`, null, Markup.keyboard([
                'Интеграция с приложением fitSmart',
                'Остановить'
            ]));
        }

        ctx.reply('ID приложения не найдено(');
    });

const stage = new Stage(scene);
vk.use(session.middleware());
vk.use(stage.middleware());

vk.command('Интеграция с приложением fitSmart', (ctx) => {
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE vkId = @vkId`).get({
        vkId: +ctx.message.from_id
    });

    if (stingray) {
        return ctx.reply(`Приложение уже интегрирован.\n\nID: ${stingray.id}\n\nPS: Чтобы остановить интеграцию нажмите на кнопку: Остановить.`, null, Markup.keyboard([
            'Остановить'
        ]));
    }
    ctx.scene.enter('integrate');
});

vk.command('Остановить', (ctx) => {
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE vkId = @vkId`).get({
        vkId: +ctx.message.from_id
    });

    if (stingray) {
        const stingrayUpdate = DATABASE.stingray.prepare(`UPDATE stingray SET vkId = @vkId, vkIntegrated = @vkIntegrated WHERE id = @id`);
        stingrayUpdate.run({
            vkId: null,
            vkIntegrated: 0,
            id: stingray.id
        });
        return ctx.reply(`Интеграция с приложением остановлен.`, null, Markup.keyboard([
            'Интеграция с приложением fitSmart'
        ]));
    }
    ctx.scene.enter('integrate');
});

vk.on((ctx) => {
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE vkId = @vkId`).get({
        vkId: +ctx.message.from_id
    });

    if (stingray) {
        return ctx.reply(`Приложение уже интегрирован.\n\nID: ${stingray.id}\n\nПопробуйте отправить из приложения FitSmart упражнения или рецепты.\n\nPS: Чтобы остановить интеграцию нажмите на кнопку: Остановить.`, null, Markup.keyboard([
            'Интеграция с приложением fitSmart',
            'Остановить'
        ]));
    }
    ctx.reply('Нажмите на кнопку, чтобы начать интегрировать наше приложение в вашей приставке', null, Markup.keyboard([
        'Интеграция с приложением fitSmart'
    ]));
});

vk.startPolling(() => {
    console.log(`FitSmart is integrated with VK BOT ${process.env.VK_BOT} or search ${process.env.SHORT}`);
});

/**
 * VK bot init function
 */
exports.vkInit = () => {
    return vk;
};