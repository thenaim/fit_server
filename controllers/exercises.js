const DATABASE = require('../db');

/**
 * GET /exercises
 * get exercises
 */
exports.getExercises = (req, res) => {
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);

    let exercises = DATABASE[stingray.gender].prepare(`SELECT exercises.id, exercises.name, exercises.text, foto.name AS img_name, foto.number
    FROM exercises INNER JOIN foto ON foto.id_exercise = exercises.id_exercise
    WHERE lang = @lang and id_type = @id_type
    GROUP BY exercises.id`).all({
        lang: stingray.lang,
        id_type: +req.query.id_type
    });

    exercises.forEach(element => {
        // add images
        element.images = this.addImages(stingray.gender, element.img_name, element.number);

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

    return res.json(exercises);
};

/**
 * GET /exercises/categories
 * get exercises
 */
exports.getExercisesCategories = (req, res) => {
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);

    let exercises_types = DATABASE[stingray.gender].prepare(`SELECT id, name, image, id_type FROM exercises_types WHERE lang = ? GROUP BY id`);
    exercises_types = exercises_types.all(stingray.lang);
    exercises_types.forEach(element => {
        element.image = element.image + '.png';
    });

    return res.json(exercises_types);
};

exports.addImages = (type, img_name, image_number) => {
    const images = [];
    if (type === 'man') {
        for (let index = 1; index < image_number; index++) {
            images.push(`${img_name}${index}.png`);
        }
        images.push(`${img_name}${image_number}.png`);
    } else if (type === 'woman') {
        img_name = img_name.split('.');
        for (let index = 1; index < image_number; index++) {
            images.push(`a_${index}${img_name[0]}.${img_name[1]}`);
        }
        images.push(`a_${image_number}${img_name[0]}Version.${img_name[1]}`);
    }

    return images;
};