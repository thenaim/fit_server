const DATABASE = require('../db');

/**
 * GET /stats
 */
exports.addStats = (req, res) => {
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);
    stingray.stats = JSON.parse(stingray.stats);

    switch (req.query.type) {
        case 'video':
            stingray.stats[0].points += 1;
            stingray.stats[1].points += 2;
            break;
        case 'exercise':
            stingray.stats[0].points += 1;
            stingray.stats[2].points += 2;
            break;
        case 'exercise_play':
            stingray.stats[0].points += 1;
            stingray.stats[2].points += 2;
            break;
        case 'nutrition':
            stingray.stats[0].points += 1;
            stingray.stats[3].points += 2;
            break;
        case 'social':
            stingray.stats[0].points += 1;
            stingray.stats[4].points += 2;
            break;
        default:
            break;
    }

    let stingrayUpdate = DATABASE.stingray.prepare(`UPDATE stingray SET stats = @stats WHERE id = @id`);
    stingrayUpdate.run({
        stats: JSON.stringify(stingray.stats),
        id: req.query.stingray
    });

    return res.json({
        added: true
    });
};