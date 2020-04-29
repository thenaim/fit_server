/**
 * GET /nutritions
 * get nutritions
 */
exports.getNutritions = (req, res) => {
    const stingray = res.db.get('stingrays').find({
        id: req.query.stingray
    }).value();

    const nutritions = res.db.get(`meals`).filter({
        lang: stingray.lang,
        day: +req.query.day,
        type: stingray.meal ? 'muscle_building' : 'weight_loss'
    }).value();

    const bookmarks = res.db.get('bookmarks').filter({
        stingray: req.query.stingray,
        type: 'nutrition'
    }).value();

    nutritions.forEach(element => {
        element.image = encodeURIComponent(element.image);
        const booked = bookmarks.findIndex(obj => obj.id === element.id);
        if (booked !== -1) {
            element.bookmark = true;
        }
    });

    return res.json(nutritions);
};