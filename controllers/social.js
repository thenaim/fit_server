const FormData = require('form-data');
const path = require('path');
const DATABASE = require('../db');
const fs = require('fs');
const axios = require('axios');

/**
 * GET /send/social
 * send message to social network
 */
exports.sendSocial = async (req, res) => {
    let stingray = DATABASE.stingray.prepare(`SELECT * FROM stingray WHERE id = ?`).get(req.query.stingray);

    if (req.query.type === "exercise") {
        const exercise = DATABASE[stingray.gender].prepare(`SELECT exercises.id, exercises.name, exercises.text, foto.name AS img_name, foto.number
            FROM exercises INNER JOIN foto ON foto.id_exercise = exercises.id_exercise
        WHERE exercises.id = ? AND exercises.lang = ?`).get(+req.query.id, stingray.lang);

        const message = `${exercise.name}\n\n${exercise.text}`;
        if (req.query.social === "vk" && stingray.vkIntegrated) {
            res.vk.sendMessage(stingray.vkId, message);

            return res.json({
                sended: true
            });
        }

        if (req.query.social === "tg" && stingray.tgIntegrated) {
            res.tg.sendMessage(stingray.tgId, message);
            return res.json({
                sended: true
            });
        }
    }

    if (req.query.type === "nutrition") {
        const nutrition = DATABASE.stingray.prepare(`SELECT * FROM nutritions WHERE id = @id`).get({
            id: req.query.id
        });

        const message = `${nutrition.name}\n\n${nutrition.steps}\n\n${nutrition.ingredients}`;
        if (req.query.social === "vk" && stingray.vkIntegrated) {
            // check if image uploaded, then send by id
            // if image not uploaded, then first upload and send
            if (nutrition.vk_image_id) {
                res.vk.sendMessage(stingray.vkId, message, `photo184070499_${nutrition.vk_image_id}`);
            } else {
                const photo = await this.uploadPhotoVk(res.vk, nutrition);
                res.vk.sendMessage(stingray.vkId, message, `photo184070499_${photo.id}`);
            }

            return res.json({
                sended: true
            });
        }

        if (req.query.social === "tg" && stingray.tgIntegrated) {
            res.tg.sendMessage(stingray.tgId, message);
            return res.json({
                sended: true
            });
        }
    }

    // Add social points for sending
    stingray.stats = JSON.parse(stingray.stats);
    stingray.stats[0].points += 1;
    stingray.stats[4].points += 2;

    const stingrayUpdate = DATABASE.stingray.prepare(`UPDATE stingray SET stats = @stats WHERE id = @id`);
    stingrayUpdate.run({
        stats: JSON.stringify(stingray.stats),
        id: stingray.id
    });

    return res.json({
        sended: false
    });
};

/**
 * Upload photo vk function
 * @param  {SDK} vk sdk
 * @param  {Object} nutrition http
 * @return {Object} photo
 */
this.uploadPhotoVk = async (vk, nutrition) => {
    const {
        upload_url: url
    } = await vk.execute('photos.getMessagesUploadServer', {
        peer_id: 184070499,
    });

    const form = new FormData();

    nutrition.image = nutrition.image.split('.');
    nutrition.image = nutrition.image[0] + '.jpg';
    const imagePath = path.resolve(__dirname, '../public/images/coverMeal/' + nutrition.image);
    form.append('photo', fs.createReadStream(imagePath));

    const {
        data
    } = await axios.post(url, form, {
        headers: form.getHeaders(),
    });

    const [photo] = await vk.execute('photos.saveMessagesPhoto', data);

    const nutritionUpdated = DATABASE.stingray.prepare('UPDATE nutritions SET vk_image_id = @vk_image_id WHERE id = @id');
    nutritionUpdated.run({
        id: nutrition.id,
        vk_image_id: photo.id
    });

    return photo;
};