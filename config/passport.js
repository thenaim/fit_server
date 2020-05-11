exports.authTokenValidator = (req, res, next) => {
    const auth = req.query.token;
    if (auth === process.env.AUTH_TOKEN) {
        next();
    } else {
        res.status(401).json({
            auth: false
        });
    }
};