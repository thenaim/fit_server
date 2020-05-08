const DATABASE = require('../db');

/**
 * GET /settings/update/stingray
 * get settings/update/stingray
 */
exports.updateStingray = (req, res) => {
    let assings = {};
    const sqlSET = [];
    const params = ['isDark', 'gender', 'workoutDays', 'meal', 'lang'];
    for (const field of params) {
        if (req.query[field]) {
            assings[field] = req.query[field];
            sqlSET.push(`${field} = @${field}`);
        }
    }

    if (assings.isDark) {
        assings.isDark = (assings.isDark === '1') ? 1 : 0;
    }

    if (assings.meal) {
        assings.meal = (assings.meal === '1') ? 1 : 0;
    }

    if (assings.workoutDays) {
        assings.workoutDays = parseInt(assings.workoutDays);
    }


    let stingrayUpdate = DATABASE.stingray.prepare(`UPDATE stingray SET ${sqlSET.join(', ')} WHERE id = ?`);
    stingrayUpdate = stingrayUpdate.run(assings, req.query.stingray);

    return res.json({
        updated: true
    });
};