/**
 * GET /exercises
 * get exercises
 */
exports.getExercises = (req, res) => {
    if (!req.query.id_type) {
        return res.json({
            fieldNotFound: true,
            type: req.query.id_type
        });
    }

    const stingray = res.db.get('stingrays').find({
        id: req.query.stingray
    }).value();

    const bookmarks = res.db.get('bookmarks').filter({
        stingray: stingray.id,
        type: 'exercise'
    }).value();

    let exercises = res.db.get('exercises').filter({
        lang: stingray.lang,
        gender: stingray.gender,
        id_type: +req.query.id_type
    }).value();

    if (!exercises) return res.json({
        not_found: true
    });

    exercises.forEach(element => {
        const book = bookmarks.find(x => x.id === element.id.toString());
        if (book) {
            element.bookmark = true;
        }
    });

    return res.json(exercises);
};

/**
 * GET /exercises/categories
 * get exercises
 */
exports.getExercisesCategories = (req, res) => {
    const stingray = res.db.get('stingrays').find({
        id: req.query.stingray
    }).value();

    const exercises_types = res.db.get('exercises_types').filter({
        lang: stingray.lang,
        gender: stingray.gender,
    }).value();

    return res.json(exercises_types);
};

/**
 * GET /exercises/categories
 * get exercises
 */
exports.sendExercises = (req, res) => {
    const exercise = res.db.get('types').find({
        id: req.query.id
    }).value();

    const stingray = res.db.get('stingrays').find({
        id: req.query.stingray
    }).value();

    if (stingray && stingray.vkIntegrated) {
        const message = `${exercise.name}\n\n${exercise.detail}`;
        res.vk.sendMessage(stingray.vkId, message);

        return res.json({
            sended: true
        });
    } else {
        return res.json({
            sended: false
        });
    }
};