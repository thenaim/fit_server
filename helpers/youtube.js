const ytdl = require('ytdl-core');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./assets/DB/db.json');
const db = low(adapter);
const fs = require('fs');

function saveVideo(params) {
    return new Promise(function (resolve, reject) {

        ytdl(`http://www.youtube.com/watch?v=${params.v}`, {
            filter: format => format.container === 'mp4',
        }).pipe(
            fs.createWriteStream(`./public/videos/${params.v}.mp4`)
        );
        const videos = db.get('videos').find({
            videoId: params.v
        }).value();

        if (videos) return resolve('video_exist');

        ytdl.getInfo(params.v, (err, info) => {
            if (err || !info) return reject('not_found');

            const videoDetails = info.player_response.videoDetails;
            const getFormat = ytdl.filterFormats(info.formats, 'audioandvideo');
            const finalFormats = [];

            getFormat.forEach((f) => {
                finalFormats.push({
                    mimeType: f.mimeType,
                    qualityLabel: f.qualityLabel,
                    width: f.width,
                    height: f.height,
                    quality: f.quality,
                    fps: f.fps,
                    projectionType: f.projectionType,
                    container: f.container,
                    codecs: f.codecs,
                });
            });

            videoDetails.authorDetail = info.author;
            videoDetails.published = info.published;
            videoDetails.formats = finalFormats;
            videoDetails.gender = params.gender;
            videoDetails.type = params.type;

            db.get('videos').push(videoDetails).write();

            return resolve(getFormat);
        });
    });
}

exports.saveVideo = saveVideo;