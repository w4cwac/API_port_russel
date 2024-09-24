const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

/**
 * Vérifie le jeton JWT dans les cookies ou les en-têtes de la requête.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Avec le token récupéré dans les cookies ou dans l'en-tête de la requette.
 * @param {Object} res - L'objet de réponse HTTP.
 * @param {Function} next - La fonction middleware suivante.
 */
exports.checkJWT = async (req, res, next) => {
    let token = req.cookies.token || req.headers['authorization']
    if (!!token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.lenght);
    }

    if (token) {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json('token_not_valid');
            } else {
                req.decoded = decoded;

                const expiresIn = 24 * 60 * 60; 
                const newToken = jwt.sign({
                    user : decoded.user
                },
                SECRET_KEY,
                {
                    expiresIn : expiresIn
                });

                res.header('Authorization', 'Bearer ' + newToken);
                next();
            }
        });
    } else {
        return res.status(401).json('token_required');
    }
}