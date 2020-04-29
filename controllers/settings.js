const youtube = require('../helpers/youtube');

/**
 * GET /settings
 * get settings
 */
exports.getSettings = (req, res) => {
    res.json("SETTINGS!");
};

/**
 * GET /settings/themechange
 * get settings/themechange
 */
exports.themeChange = (req, res) => {
    res.db.get('stingrays').find({
        id: req.query.stingray
    }).assign({
        isDark: req.query.isDark = (req.query.isDark === 'true')
    }).write();

    return res.json({
        changed: true
    });
};

/**
 * GET /settings/update/stingray
 * get settings/update/stingray
 */
exports.updateStingray = (req, res) => {
    let assings = {};
    const params = ['isDark', 'gender', 'meal', 'lang'];
    for (const field of params) {
        if (req.query[field]) {
            assings[field] = req.query[field];
        }
    }

    if (assings.isDark) {
        assings.isDark = (assings.isDark === 'true');
    }

    if (assings.meal) {
        assings.meal = (assings.meal === 'true');
    }

    res.db.get('stingrays').find({
        id: req.query.stingray
    }).assign(assings).write();

    return res.json({
        updated: true
    });
};