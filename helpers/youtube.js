const ytdl = require('ytdl-core');
const DATABASE = require('../db');

function saveVideo(params) {
    return new Promise(function (resolve, reject) {

        const video = DATABASE.stingray.prepare(`SELECT * FROM videos WHERE video LIKE '%${params.v}%'`).get();

        if (video) return resolve('video_exist');

        ytdl.getInfo(params.v, (err, info) => {
            if (err || !info) return reject('not_found');

            const videoDetails = info.player_response.videoDetails;

            videoDetails.authorDetail = info.author;
            videoDetails.published = info.published;

            const videoINSERT = DATABASE.stingray.prepare('INSERT INTO videos VALUES (NULL, @video, @gender, @lang)');
            videoINSERT.run({
                video: JSON.stringify(videoDetails),
                gender: params.gender,
                lang: params.lang
            });

            return resolve({
                done: true
            });
        });
    });
}

exports.saveVideo = saveVideo;