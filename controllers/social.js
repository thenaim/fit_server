const nutritionController = require('../controllers/nutrition');

/**
 * GET /send/social
 * send message to social network
 */
exports.sendSocial = (req, res) => {
    const stingray = res.db.get('stingrays').find({
        id: req.query.stingray
    }).value();

    if (req.query.type === "exercise") {
        const exercise = res.db.get('exercises').find({
            lang: 'ru',
            gender: 'man',
            id: +req.query.id
        }).value();

        const message = `${exercise.name}\n\n${exercise.text}`;
        if (req.query.social === "vk" && stingray.vkIntegrated) {
            res.vk.sendMessage(stingray.vkId, message);

            return res.json({
                sended: true
            });
        }

        if (req.query.social === "tg" && stingray.tgIntegrated) {
            res.tg.sendMessage(stingray.tgId, message);
            return res.json({
                sended: true
            });
        }
    }

    if (req.query.type === "nutrition") {
        let nutrition = res.db.get(`meals`).find({
            id: req.query.id
        }).value();

        const message = `${nutrition.name}\n\n${nutrition.steps}\n\n${nutrition.ingredients}`;
        if (req.query.social === "vk" && stingray.vkIntegrated) {
            res.vk.sendMessage(stingray.vkId, message);

            return res.json({
                sended: true
            });
        }

        if (req.query.social === "tg" && stingray.tgIntegrated) {
            res.tg.sendMessage(stingray.tgId, message);
            return res.json({
                sended: true
            });
        }
    }

    // Add social points for sending
    stingray.stats[0].points += 1;
    stingray.stats[4].points += 2;

    res.db.get('stingrays').find({
        id: req.query.stingray
    }).assign(stingray).write();

    return res.json({
        sended: false
    });
};