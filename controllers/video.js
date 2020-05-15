const youtube = require('../helpers/youtube');
const DATABASE = require('../db');

/**
 * GET /watch
 * save video and download
 */
exports.saveVideo = (req, res) => {
    const params = ['v', 'gender', 'lang'];
    for (const field of params) {
        if (!req.query[field]) {
            return res.json({
                fieldNotFound: true,
                field
            });
        }
    }

    youtube.saveVideo(req.query)
        .then((data) => res.status(200).json(data))
        .catch((err) => res.status(404).json(err));
};

/**
 * GET /videos
 * get videos
 */
exports.getVideos = (req, res) => {
    const stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);

    let videos = DATABASE.stingray.prepare(`SELECT * FROM videos WHERE gender = ? AND lang = ?`).all(
        stingray.gender,
        stingray.lang
    );
    const finalVideos = [];
    videos.forEach(element => {
        finalVideos.push(JSON.parse(element.video));
    });

    finalVideos.forEach(element => {
        // check bookmarked or not
        const checkBookmark = DATABASE.stingray.prepare(`SELECT * FROM bookmarks WHERE stingray = ? AND id_type = ? AND type = ?`).get(
            stingray.id,
            element.videoId,
            'video'
        );
        if (checkBookmark) {
            element.bookmark = true;
        }
    });

    return res.json(finalVideos);
};