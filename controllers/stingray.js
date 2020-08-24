const DATABASE = require('../db');
const statsController = require('./stats');

/**
 * GET /stingray
 * returns id and ather keys
 */
exports.getKeys = (req, res) => {
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get('48718619');
    if (stingray) {
        stingray.stats = JSON.parse(stingray.stats);
        stingray.leaderboard = statsController.leaderboard(stingray.id);
        return res.json(stingray);
    }

    stingray = {
        id: makeid(8),
        isDark: 0, // dark|light
        gender: 'woman', // man|woman
        meal: 1, // muscle_building|weight_loss
        workoutDays: 1, // 1|2|3 - 2|3|4 days per week
        lang: 'ru',
        vkId: '',
        vkIntegrated: 0,
        tgId: '',
        tgIntegrated: 0,
        level: 'beginner',

        // Stats
        stats: [{
                name: {
                    ru: "FIT баллы",
                    en: "FIT points"
                },
                points: 64,
                colors: "#0779e4"
            },
            {
                name: {
                    ru: "Просмотры Видео",
                    en: "Video views"
                },
                points: 248,
                colors: "#511845"
            },
            {
                name: {
                    ru: "Просмотры упражнений",
                    en: "Exercise views"
                },
                points: 33,
                colors: "#eb4559"
            },
            {
                name: {
                    ru: "Просмотры рецептов",
                    en: "Nutrition views"
                },
                points: 56,
                colors: "#ffe75e"
            },
            {
                name: {
                    ru: "Социальные сети",
                    en: "Social networks"
                },
                points: 21,
                colors: "#7fa998"
            }
        ]
    };

    // Save sqlite
    stingray.stats = JSON.stringify(stingray.stats);
    const stingrayINSERT = DATABASE.stingray.prepare('INSERT INTO stingray VALUES (@id, @isDark, @gender, @meal, @lang, @vkId, @vkIntegrated, @tgId, @tgIntegrated, @stats, @workoutDays, @level)');
    stingrayINSERT.run(stingray);

    addExampleBookmarks(stingray.id);

    stingray.stats = JSON.parse(stingray.stats);
    stingray.leaderboard = statsController.leaderboard(stingray.id);
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

function addExampleBookmarks(id) {
    const bookmarkINSERT = DATABASE.stingray.prepare('INSERT INTO bookmarks VALUES (NULL, @id_type, @type, @stingray)');
    const exampleData = [{
            id_type: 'RZqZ4Xml-0o',
            type: 'video',
            stingray: id
        },
        {
            id_type: 'bnzHECC0Z8A',
            type: 'video',
            stingray: id
        },
        {
            id_type: 'PqQrqiqOM6U',
            type: 'video',
            stingray: id
        },
        {
            id_type: '544',
            type: 'exercise',
            stingray: id
        },
        {
            id_type: '545',
            type: 'exercise',
            stingray: id
        },
        {
            id_type: '1zgda0zg5',
            type: 'nutrition',
            stingray: id
        },
        {
            id_type: 'i3ey6tcla',
            type: 'nutrition',
            stingray: id
        },
        {
            id_type: 'xrwu6l2zh',
            type: 'nutrition',
            stingray: id
        }
    ];

    exampleData.forEach((element) => {
        bookmarkINSERT.run(element);
    })
}