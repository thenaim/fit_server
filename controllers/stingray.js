/**
 * GET /stingray
 * returns id and ather keys
 */
exports.getKeys = (req, res) => {
    let stingray = res.db.get('stingrays').find({
        id: req.query.stingray
    }).value();
    if (stingray) return res.json(stingray);

    stingray = {
        id: Math.random().toString(36).toUpperCase().slice(-6),
        isDark: true, // dark|light
        gender: 'woman', // man|woman
        meal: true, // muscle_building|weight_loss
        lang: 'ru',
        vkId: '',
        vkIntegrated: false,
        tgId: '',
        tgIntegrated: false,

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
    res.db.get('stingrays').push(stingray).write();
    res.json(stingray);
};