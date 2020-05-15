const DATABASE = require('../db');

/**
 * Leaderboard
 */
exports.leaderboard = (stingrayId) => {
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray`).all();
    const leaderboard = [];
    stingray.forEach((stin) => {
        stin.stats = JSON.parse(stin.stats);
        if (stin.id !== stingrayId) {
            stin.id = stin.id.slice(0, -4) + '****';
        }
        stin.points = 0;
        stin.stats.forEach(stat => {
            stin.points += stat.points;
        });
        leaderboard.push({
            id: stin.id,
            points: stin.points
        });
    });

    return leaderboard.sort((a, b) => b.points - a.points).slice(0, 5);
};

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