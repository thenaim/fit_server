const DATABASE = require('../db');

/**
 * GET /send/social
 * send message to social network
 */
exports.sendSocial = (req, res) => {
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);

    if (req.query.type === "exercise") {
        const exercise = DATABASE[stingray.gender].prepare(`SELECT exercises.id, exercises.name, exercises.text, foto.name AS img_name, foto.number
            FROM exercises INNER JOIN foto ON foto.id_exercise = exercises.id_exercise
        WHERE exercises.id = ?`).get(+req.query.id);

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
        const nutrition = DATABASE.stingray.prepare(`SELECT * FROM nutritions WHERE id = @id`).get({
            id: req.query.id
        });

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