const jwt = require('./jwt');

module.exports = function checkAuth(req, res, next) {
    const token = req.get('Authorization');
    if (!token) {
        res.status(401).json({ error: 'no authorization found' });
        return;
    }
//if this is not a verifed token by the jwt package then throw error. 
    let payload = null;
    try {
        payload = jwt.verify(token);
    }
    catch (err) {
        // this code runs with verify fails
        res.status(401).json({ error: 'invalid token' });
        return;
    }

    req.userId = payload.id;
    next();
};