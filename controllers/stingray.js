const DATABASE = require('../db');

/**
 * GET /stingray
 * returns id and ather keys
 */
exports.getKeys = (req, res) => {
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);
    if (stingray) {
        stingray.stats = JSON.parse(stingray.stats);
        return res.json(stingray);
    }

    stingray = {
        id: makeid(8),
        isDark: 1, // dark|light
        gender: 'woman', // man|woman
        meal: 1, // muscle_building|weight_loss
        lang: 'ru',
        vkId: '',
        vkIntegrated: 0,
        tgId: '',
        tgIntegrated: 0,

        // Stats
        stats: [{
                name: {
                    ru: "FIT баллы",
                    en: "FIT points"
                },
                points: 0,
                colors: "#0779e4"
            },
            {
                name: {
                    ru: "Просмотры Видео",
                    en: "Video views"
                },
                points: 0,
                colors: "#511845"
            },
            {
                name: {
                    ru: "Просмотры упражнений",
                    en: "Exercise views"
                },
                points: 0,
                colors: "#eb4559"
            },
            {
                name: {
                    ru: "Просмотры рецептов",
                    en: "Nutrition views"
                },
                points: 0,
                colors: "#ffe75e"
            },
            {
                name: {
                    ru: "Социальные сети",
                    en: "Social networks"
                },
                points: 0,
                colors: "#7fa998"
            }
        ]
    };

    // Save sqlite
    stingray.stats = JSON.stringify(stingray.stats);
    const stingrayINSERT = DATABASE.stingray.prepare('INSERT INTO stingray VALUES (@id, @isDark, @gender, @meal, @lang, @vkId, @vkIntegrated, @tgId, @tgIntegrated, @stats)');
    stingrayINSERT.run(stingray);

    stingray.stats = JSON.parse(stingray.stats);
    res.json(stingray);
};

function makeid(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}