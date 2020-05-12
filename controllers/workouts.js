const DATABASE = require('../db');
const exercisesController = require('./exercises');

/**
 * GET /workouts/days
 * get workouts/days
 */
exports.getWorkuotsDays = (req, res) => {
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);

    const days = DATABASE[stingray.gender].prepare(`SELECT * FROM days
        WHERE lang = @lang`).all({
        lang: stingray.lang
    });

    let final = {
        title: {
            ru: 'Сколько дней в неделю вы готовы тренироваться?',
            en: 'How many days a week are you ready to train?'
        },
        items: []
    };
    days.forEach((element, index) => {
        final.items.push({
            id: element.id_day,
            data: element.title
        });
        // add cancel on end
        if (index === days.length - 1) {
            final.items.push({
                id: "cancel",
                data: {
                    ru: "Отменить",
                    en: "Cancel"
                }
            });
        }
    });

    return res.json(final);
};

/**
 * GET /workouts/category
 * get workouts/category
 */
exports.getWorkuotsCategory = (req, res) => {
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);

    const workouts = DATABASE[stingray.gender].prepare(`SELECT id, categ_name, image, id_categ FROM categories_guides
        WHERE lang = @lang`).all({
        lang: stingray.lang
    });

    return res.json(workouts);
};

/**
 * GET /workouts
 * get workouts
 */
exports.getWorkuots = (req, res) => {
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);

    const workouts = DATABASE[stingray.gender].prepare(`SELECT exercises.id, exercises.name, exercises.text, foto.name AS img_name, foto.number, guides.id_num_days, guides.day FROM guides
        INNER JOIN exercises ON exercises.id_exercise = guides.id_exercises
        INNER JOIN foto ON foto.id_exercise = exercises.id_exercise
    WHERE guides.id_categ_guide = @id_categ AND guides.id_num_days = @id_num_days AND exercises.lang = @lang`).all({
        id_categ: +req.query.id_categ,
        id_num_days: stingray.workoutDays,
        lang: stingray.lang
    });

    workouts.forEach(element => {
        // add images
        element.images = exercisesController.addImages(stingray.gender, element.img_name, element.number);

        // check bookmarked or not
        const checkBookmark = DATABASE.stingray.prepare(`SELECT * FROM bookmarks WHERE stingray = ? AND id_type = ? AND type = ?`).get(
            stingray.id,
            element.id.toString(),
            'exercise'
        );
        if (checkBookmark) {
            element.bookmark = true;
        }
    });

    workouts.sort((a, b) => {
        return (parseInt(a.day) - parseInt(b.day));
    });

    return res.json(workouts);
};