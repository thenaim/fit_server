const ytdl = require('ytdl-core');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./assets/DB/db.json');
const db = low(adapter);
const fs = require('fs');

const DATABASE = require('../db');

function saveVideo(params) {
    return new Promise(function (resolve, reject) {
        const videos = db.get('videos').find({
            videoId: params.v
        }).value();

        if (videos) return resolve('video_exist');

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