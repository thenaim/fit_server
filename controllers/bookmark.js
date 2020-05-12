const DATABASE = require('../db');
const exercisesController = require('./exercises');
/**
 * GET /bookmarks
 * get user bookmarks
 */
exports.getBookmarks = (req, res) => {
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);
    stingray.stats = JSON.parse(stingray.stats);

    const bookmarks = DATABASE.stingray.prepare(`SELECT * FROM bookmarks WHERE stingray = ? AND type = ?`).all(
        stingray.id,
        req.query.type
    );

    if (req.query.type === "video") {
        const videos = res.db.get('videos').value();
        const videosFinal = [];

        bookmarks.forEach(element => {
            const vid = videos.find(x => x.videoId === element.id_type);
            if (vid) {
                vid.bookmark = true;
                videosFinal.push(vid);
            }
        });

        return res.json(videosFinal);
    }

    if (req.query.type === "exercise") {
        let exercisesFinal = [];
        bookmarks.forEach(element => {
            let exercise = DATABASE[stingray.gender].prepare(`SELECT exercises.id, exercises.name, exercises.text, foto.name AS img_name, foto.number
            FROM exercises INNER JOIN foto ON foto.id_exercise = exercises.id_exercise
            WHERE exercises.id = ?`).get(+element.id_type);

            if (exercise) {
                exercise.images = exercisesController.addImages(stingray.gender, exercise.img_name, exercise.number);
                exercise.bookmark = true;
                exercisesFinal.push(exercise);
            }
        });

        return res.json(exercisesFinal);
    }

    if (req.query.type === "nutrition") {
        const nutritionsFinal = [];
        bookmarks.forEach(element => {
            let nutritionCheck = DATABASE.stingray.prepare(`SELECT * FROM nutritions WHERE id = @id`).get({
                id: element.id_type
            });
            if (nutritionCheck) {
                nutritionCheck.image = encodeURIComponent(nutritionCheck.image);
                nutritionCheck.bookmark = true;
                nutritionsFinal.push(nutritionCheck);
            }
        });

        return res.json(nutritionsFinal);
    }
};

/**
 * POST /bookmarks/addDelete
 * add or delete user bookmark
 */
exports.addDeleteBookmarks = (req, res) => {
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);
    stingray.stats = JSON.parse(stingray.stats);

    let bookmark = {
        stingray: stingray.id,
        id_type: req.query.id,
        type: req.query.type
    };

    const checkBookmark = DATABASE.stingray.prepare(`SELECT * FROM bookmarks WHERE stingray = @stingray AND id_type = @id_type AND type = @type`).get({
        stingray: stingray.id,
        id_type: req.query.id,
        type: req.query.type
    });

    if (checkBookmark) {
        const deleteBookmark = DATABASE.stingray.prepare(`DELETE FROM bookmarks WHERE id = ?`).run(
            checkBookmark.id
        );
        bookmark.added = false;
    } else {
        const bookmarkINSERT = DATABASE.stingray.prepare('INSERT INTO bookmarks VALUES (NULL, @id_type, @type, @stingray)');
        bookmarkINSERT.run(bookmark);
        bookmark.added = true;
    }

    // Add fit points for add/delete bookmark
    stingray.stats[0].points += 1;
    stingray.stats = JSON.stringify(stingray.stats);

    let stingrayUpdate = DATABASE.stingray.prepare(`UPDATE stingray SET stats = @stats WHERE id = @id`);
    stingrayUpdate.run({
        stats: stingray.stats,
        id: stingray.id
    });

    return res.json(bookmark);
};