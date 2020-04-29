/**
 * GET /stats
 */
exports.addStats = (req, res) => {
    let stingray = res.db.get('stingrays').find({
        id: req.query.stingray
    }).value();

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

    res.db.get('stingrays').find({
        id: req.query.stingray
    }).assign(stingray).write();

    return res.json({
        added: true
    });
};