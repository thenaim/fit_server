/**
 * GET /bookmarks
 * get user bookmarks
 */
exports.getBookmarks = (req, res) => {
    const stingray = res.db.get('stingrays').find({
        id: req.query.stingray
    }).value();

    const bookmarks = res.db.get('bookmarks').filter({
        stingray: req.query.stingray,
        type: req.query.type
    }).value();
    if (!bookmarks) return res.json([]);

    if (req.query.type === "video") {
        const videos = res.db.get('videos').value();
        const videosFinal = [];

        bookmarks.forEach(element => {
            const vid = videos.find(x => x.videoId === element.id);
            if (vid) {
                vid.bookmark = true;
                videosFinal.push(vid);
            }
        });

        return res.json(videosFinal);
    }

    if (req.query.type === "exercise") {
        const exercises = res.db.get('exercises').filter({
            gender: stingray.gender,
        }).value();
        let exercisesFinal = [];
        bookmarks.forEach(element => {
            let exer = exercises.find(x => x.id === +element.id);
            if (exer) {
                exer.bookmark = true;
                exercisesFinal.push(exer);
            }
        });

        return res.json(exercisesFinal);
    }

    if (req.query.type === "nutrition") {
        const nutritions = res.db.get(`meals`).value();
        const nutritionsFinal = [];

        bookmarks.forEach(element => {
            let book = nutritions.find(x => x.id === element.id);
            if (book) {
                book.image = encodeURIComponent(book.image);
                book.bookmark = true;
                nutritionsFinal.push(book);
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
    const stingray = res.db.get('stingrays').find({
        id: req.query.stingray
    }).value();
    if (!stingray) return res.json({
        stingrayNotFound: true
    });

    let bookmark = {
        stingray: req.query.stingray,
        id: req.query.id,
        type: req.query.type
    };

    const checkBookmark = res.db.get('bookmarks').find(bookmark).value();
    if (checkBookmark) {
        res.db.get('bookmarks').remove(bookmark).write();
        bookmark.added = false;
        return res.json(bookmark);
    }
    res.db.get('bookmarks').push(bookmark).write();
    bookmark.added = true;

    // Add fit points for add/delete bookmark
    stingray.stats[0].points += 1;

    res.db.get('stingrays').find({
        id: req.query.stingray
    }).assign(stingray).write();

    return res.json(bookmark);
};