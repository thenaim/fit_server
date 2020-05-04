const fs = require('fs');
const youtube = require('../helpers/youtube');

/**
 * GET /watch
 * save video and download
 */
exports.saveVideo = (req, res) => {
    const params = ['v', 'gender', 'type'];
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
    const videos = res.db.get('videos').value();
    const bookmarks = res.db.get('bookmarks').filter({
        stingray: req.query.stingray
    }).value();

    bookmarks.forEach(element => {
        const index = videos.findIndex(obj => obj.videoId === element.id);
        if (index !== -1) {
            videos[index].bookmark = true;
        }
    });
    return res.json(videos);
};