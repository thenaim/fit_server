exports.authTokenValidator = (req, res, next) => {
    const auth = req.query.token;
    const simpleAuthToken = "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4";

    if (auth === simpleAuthToken) {
        next();
    } else {
        res.status(401).json({
            auth: false
        });
    }
};