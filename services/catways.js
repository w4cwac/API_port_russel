const Catway = require('../models/catway');
const { body, validationResult } = require('express-validator')

/**
 * Récupère tous les catways.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP.
 * @param {Object} res - L'objet de réponse HTTP. Fait le rendu de la page Embarquadaires, qui affiche tous les catways.
 * @param {Function} next - La fonction middleware suivante.
 */
exports.getAll = async (req, res, next) => {
    try {
        let catways = await Catway.find({});
        
        if (catways) {
            return res.render('catways', { title: 'Embarquadaires', catways: catways });
        }
    } catch (e) {
        return res.status(501).json(e);
    }
}

/**
 * Récupère un catway spécifique par son ID.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère l'id du catways recherché dans l'URL de la requette.
 * @param {Object} res - L'objet de réponse HTTP. Fait le rendu de la page d'info sur le catway.
 * @param {Function} next - La fonction middleware suivante.
 */
exports.getById = async (req, res, next) => {
    const id = req.params.id 

    try {
        let catway = await Catway.findById(id);

        if (catway) {
            return res.render('catwayInfo', { title: "Info sur l'embarquadaire", catway: catway});
        }

        return res.status(404).json('catway-not-found');
    } catch (e) {
        return res.status(501).json(e);
    }
}

/**
 * Ajoute un nouveau catway.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère dans le corps de la requette les variable : catwayNumber; type; catwayState.
 * @param {Object} res - L'objet de réponse HTTP. Renvoie les codes nécessaire de succés ou d'échec de le requette. 
 * @param {Function} next - La fonction middleware suivante.
 */
exports.add = [
    // Définition des règles de validation
        body('catwayNumber').isInt().withMessage('Le numéro du catwyas doit être un nombre'),
        body('type').trim().isIn(["long", "short"]).withMessage('Le type doit être "long" ou "short"'),
        body('catwayState').trim().optional(),

    // Fonction de traitement de la requête
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const temp = ({
            catwayNumber: req.body.catwayNumber,
            type: req.body.type,
            catwayState: req.body.catwayState
        })

        try {
            await Catway.create(temp);

            return res.redirect('/tableau-de-bord');
        } catch (e) {
            return res.status(501).json(e);
        }
    }
];

/**
 * Met à jour un catway existant.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère dans le corps de la requette les variable : catwayNumber; type; catwayState. L'id du catway est lui fourni dans l'URL de la requette.
 * @param {Object} res - L'objet de réponse HTTP. Renvoie les codes nécessaire de succés ou d'échec de le requette. 
 * @param {Function} next - La fonction middleware suivante.
 */
exports.update = [
    // Définition des règles de validation
    body('catwayNumber').optional().isInt().withMessage('Le numéro du catwyas doit être un nombre'),
    body('type').trim().optional().isIn(["long", "short"]).withMessage('Le type doit être "long" ou "short"'),
    body('catwayState').trim().optional(),

    // Fonction de traitement de la requête
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const temp = ({
            catwayNumber: req.body.catwayNumber,
            type: req.body.type,
            catwayState: req.body.catwayState
        })

        const id = req.params.id;

        try {
            let catway = await Catway.findOne({_id : id});

            if (catway) {
                Object.keys(temp).forEach((key) => {
                    if (!!temp[key]) {
                        catway[key] = temp[key];
                    }
                });

                await catway.save();
                return res.status(201).json(catway);
            }

            return res.status(404).json("catway_not_found");
        } catch (e) {
            return res.status(501).json(e);
        }
    }
];

/**
 * Supprime un catway.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Recupère l'id du catway dans l'URL de la requette. 
 * @param {Object} res - L'objet de réponse HTTP. Renvoie les codes nécessaire de succés ou d'échec de le requette. 
 * @param {Function} next - La fonction middleware suivante.
 */
exports.delete = async (req, res, next) => {
    const id = req.params.id 

    try {
        await Catway.deleteOne({ _id: id });

        return res.status(204).json('delete_ok');
    } catch (e) {
        return res.status(501).json(e)
    }
}