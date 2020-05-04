const DATABASE = require('../db');

/**
 * GET /nutritions
 * get nutritions
 */
exports.getNutritions = (req, res) => {
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);

    const nutritions = DATABASE.stingray.prepare(`SELECT * FROM nutritions WHERE lang = @lang AND day = @day AND type = @type`).all({
        lang: stingray.lang,
        day: +req.query.day,
        type: stingray.meal ? 'muscle_building' : 'weight_loss'
    });

    nutritions.forEach(element => {
        element.image = encodeURIComponent(element.image);
        // check bookmarked or not
        const checkBookmark = DATABASE.stingray.prepare(`SELECT * FROM bookmarks WHERE stingray = ? AND id_type = ? AND type = ?`).get(
            stingray.id,
            element.id.toString(),
            'nutrition'
        );
        if (checkBookmark) {
            element.bookmark = true;
        }
    });

    return res.json(nutritions);
};