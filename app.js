/**
 * Module dependencies.
 */
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const adapter = new FileAsync('./assets/DB/db.json');

/**
 * Social network bots
 */
const vkInitFunction = require('./social/vk');
const tgInitFunction = require('./social/tg');

/**
 * Express configuration.
 */
app.use(cors());
app.set("view engine", "ejs");
app.use('/static', express.static(__dirname + '/public'));
app.use('/videos', express.static(__dirname + '/public/videos'));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.vk = vkInitFunction.vkInit();
    res.tg = tgInitFunction.tgInit();

    low(adapter).then((db) => {
        res.db = db;
        next();
    });
});

/**
 * Controllers (route handlers).
 */
const stingrayController = require('./controllers/stingray');
const bookmarkController = require('./controllers/bookmark');
const exercisesController = require('./controllers/exercises');
const workoutsController = require('./controllers/workouts');
const nutritionController = require('./controllers/nutrition');
const settingsController = require('./controllers/settings');
const videoController = require('./controllers/video');
const socialController = require('./controllers/social');
const statsController = require('./controllers/stats');

/**
 * API key middleware.
 */
const passportConfig = require('./config/passport');

/**
 * App routes.
 */
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/stingray', passportConfig.authTokenValidator, stingrayController.getKeys);
app.get('/save', passportConfig.authTokenValidator, videoController.saveVideo);
app.get('/videos', passportConfig.authTokenValidator, videoController.getVideos);
app.get('/bookmarks', passportConfig.authTokenValidator, bookmarkController.getBookmarks);
app.get('/bookmarks/addDelete', passportConfig.authTokenValidator, bookmarkController.addDeleteBookmarks);
app.get('/exercises', passportConfig.authTokenValidator, exercisesController.getExercises);
app.get('/exercise/categories', passportConfig.authTokenValidator, exercisesController.getExercisesCategories);
app.get('/workouts', passportConfig.authTokenValidator, workoutsController.getWorkuots);
app.get('/workouts/category', passportConfig.authTokenValidator, workoutsController.getWorkuotsCategory);
app.get('/workouts/days', passportConfig.authTokenValidator, workoutsController.getWorkuotsDays);
app.get('/nutritions', passportConfig.authTokenValidator, nutritionController.getNutritions);
app.get('/social/send', passportConfig.authTokenValidator, socialController.sendSocial);
app.get('/stats', passportConfig.authTokenValidator, statsController.addStats);
app.get('/settings/update/stingray', passportConfig.authTokenValidator, settingsController.updateStingray);

/**
 * Start Nodejs Express server.
 */
app.listen(process.env.PORT, process.env.IPV4, () => {
    console.log(`FitSmart server is running at http://${process.env.IPV4}:${process.env.PORT}`);
});