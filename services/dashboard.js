const { body, validationResult } = require('express-validator');

const User = require('../models/user');
const Catway = require('../models/catway');
const Booking = require('../models/booking');
const { render } = require('pug');

/**
 * Affiche le tableau de bord avec les utilisateurs, catways et réservations.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP.
 * @param {Object} res - L'objet de réponse HTTP. Fait le rendu de la page dashboard en fournissant les différentes données nécessaire : title; users; catways; booking; catwayId.
 * @param {Function} next - La fonction middleware suivante.
 */
exports.dashboard = async (req, res, next) => {
    try {
        const users = await User.find({});
        const catways = await Catway.find({});
        const booking = await Booking.find({});
        const catwayId = await Catway.findOne({});
        return res.render('dashboard', { 
            title: 'Tableau de bord', 
            users: users,
            catways: catways,
            booking: booking,
            catwayId: catwayId._id
        })
    } catch (error) {
        return res.status(500).json(error);
    }
}

/**
 * Met à jour un utilisateur.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère l'id de l'utilisateur dans le corp de la requette.
 * @param {Object} res - L'objet de réponse HTTP. Fait le rendu de la page uptadeUser, qui affiche un formulaire pour renseigner les informations à mdoifier. 
 * @param {Function} next - La fonction middleware suivante.
 */
exports.updateUser = async (req, res, next) => {
    try {
        const userId = req.body.user;
        let user = await User.findById(userId);

        return res.render('updateUser', {
            title: "Update user",
            user: user
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

/**
 * Met à jour un utilisateur par ID.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère les données du formulaire de la page updateUser.
 * @param {Object} res - L'objet de réponse HTTP. Fait appelle à la requette du modification d'un utilisateur. 
 * @param {Function} next - La fonction middleware suivante.
 */
exports.updateUserById = async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let temp = {
            "name": req.body.name,
            "email": req.body.email,
            "password": req.body.password
          }

    try {
      const id = req.params.id;
  
      const token = req.cookies.token;

      // Check si présence du token
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing authorization token' });
      }
  
      // Patch request avec token et gestion de l'erreur
      fetch(`http://${process.env.API_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
          'authorization': `Bearer ${token}`, // Inclusion du tekon dans le header
          "Content-Type": "application/json",
        },
        body: JSON.stringify(temp),
      })
        .then(response => {
          if (response.ok) {
            //console.log("Utilisateur modifier ");
            return res.redirect('/tableau-de-bord');
          } else {
            return response.json().then(errorData => {
              return res.status(response.status).json(errorData);
            });
          }
        })
        .catch(error => {
          console.error('Error updating user:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        });
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  /**
 * Supprime un utilisateur.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère l'id de l'utilisateur à supprimer dans l'URL.
 * @param {Object} res - L'objet de réponse HTTP. Fait appelle à la requette de suppression d'un utilisateur.
 * @param {Function} next - La fonction middleware suivante.
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.query.user;

        const token = req.cookies.token;

        if (!token) {
          return res.status(401).json({ message: 'Unauthorized: Missing authorization token' });
        };

        // Delete request avec token et gestion de l'erreur
        fetch(`http://${process.env.API_URL}/users/${userId}`, {
          method: "DELETE",
          headers: {
            'authorization': `Bearer ${token}`, // Inclusion du tekon dans le header
          }
        })
          .then(response => {
            if (response.ok) {
              //console.log("Utilisateur supprimé ");
              return res.redirect('/tableau-de-bord');
            } else {
              return response.json().then(errorData => {
                return res.status(response.status).json(errorData);
              });
            }
          })
          .catch(error => {
            console.error('Error deleting user:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
          });
      } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
};

/**
 * Met à jour un catway.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère l'ID du catways dans l'URL
 * @param {Object} res - L'objet de réponse HTTP. Fait le rendu de la page updateCatway qui affiche un formulaire. 
 * @param {Function} next - La fonction middleware suivante.
 */
exports.updateCatway = async (req, res, next) => {
  try {
      const catwayId = req.params.id;
      let catway = await Catway.findById(catwayId);

      return res.render('updateCatway', {
          title: "Update Catway",
          catway: catway
      });
  } catch (error) {
      return res.status(500).json(error);
  }
};

/**
 * Met à jour la description d'un catway par ID.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère les informations du formulaire de la page updateCatway.
 * @param {Object} res - L'objet de réponse HTTP. Fait appel à la fonction de modificaiton d'un catway.
 * @param {Function} next - La fonction middleware suivante.
 */
exports.updateCatwayById = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  let temp = {
      "catwayState": req.body.catwayState
    }

  try {
    const id = req.params.id;

    const token = req.cookies.token;

    // Check si présence du token
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Missing authorization token' });
    }

    // Patch request avec token et gestion de l'erreur
    fetch(`http://${process.env.API_URL}/catways/${id}`, {
      method: "PATCH",
      headers: {
        'authorization': `Bearer ${token}`, // Inclusion du tekon dans le header
        "Content-Type": "application/json",
      },
      body: JSON.stringify(temp),
    })
      .then(response => {
        if (response.ok) {
          //console.log("Utilisateur modifier ");
          return res.redirect('/tableau-de-bord');
        } else {
          return response.json().then(errorData => {
            return res.status(response.status).json(errorData);
          });
        }
      })
      .catch(error => {
        console.error('Error updating catway:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Supprime un catway.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère l'ID du catway dans l'URL de la page. 
 * @param {Object} res - L'objet de réponse HTTP. Fait appel à la requette de suppression d'un catway.
 * @param {Function} next - La fonction middleware suivante.
 */
exports.deleteCatway = async (req, res, next) => {
  try {
      const id = req.params.id;
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing authorization token' });
      };

      // Delete request avec token et gestion de l'erreur
      fetch(`http://${process.env.API_URL}catways/${id}`, {
        method: "DELETE",
        headers: {
          'authorization': `Bearer ${token}`, // Inclusion du tekon dans le header
        }
      })
        .then(response => {
          if (response.ok) {
            return res.redirect('/tableau-de-bord');
          } else {
            return response.json().then(errorData => {
              return res.status(response.status).json(errorData);
            });
          }
        })
        .catch(error => {
          console.error('Error deleting catway:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        });
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

/**
 * Ajoute une réservation.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère les informations du formulaire qui permet de rajouter une réservation sur la page dashboard.
 * @param {Object} res - L'objet de réponse HTTP. Fait appel à la requette d'ajout d'une réservation. 
 * @param {Function} next - La fonction middleware suivante.
 */
  exports.addBooking = async (req, res, next) => {
    try {
      const catway = JSON.parse(req.body.catwayNumber);

      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing authorization token' });
      };

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      myHeaders.append("Authorization", token);

      const urlencoded = new URLSearchParams();
      urlencoded.append("bookingId", req.body.bookingId);
      urlencoded.append("clientName", req.body.clientName);
      urlencoded.append("boatName", req.body.boatName);
      urlencoded.append("checkIn", req.body.checkIn);
      urlencoded.append("checkOut", req.body.checkOut);

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded
      };

      await fetch(`http://${process.env.API_URL}/catways/${catway._id}/reservations`, 
        requestOptions)
        .then(response => {
          if (response.ok) {
            return res.redirect('/tableau-de-bord');
          } else {
            return response.json().then(errorData => {
              return res.status(response.status).json(errorData);
            });
          }
        })
        .catch(error => {
          console.error('Error deleting catway:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        });
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

/**
 * Récupère les informations d'une réservation.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère l'ID de la réservation dans l'URL.
 * @param {Object} res - L'objet de réponse HTTP. Redirige vers la page qui présente les informations d'une réservation.
 * @param {Function} next - La fonction middleware suivante.
 */
exports.getBookingInfo = async (req, res, next) => {
  try {
    const id = req.params.id;

    const book = await Booking.findById(id);

    const catway = await Catway.findOne({catwayNumber: book.catwayNumber})

    return res.redirect(`/catways/${catway._id}/reservations/${book._id}`)
  } catch (error) {
    console.error('Unexpected error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Supprime une réservation.
 * @function
 * @async
 * @param {Object} req - L'objet de requête HTTP. Récupère l'id de la réservaition dans l'URL de la page.
 * @param {Object} res - L'objet de réponse HTTP. Fait appel à la requette de suppression d'une réservation. 
 * @param {Function} next - La fonction middleware suivante.
 */
exports.deleteBooking = async (req, res, next) => {
  try {
      const id = req.params.id;
      const token = req.cookies.token;

      const book = await Booking.findById(id);
      const catway = await Catway.findOne({"catwayNumber": book.catwayNumber});

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing authorization token' });
      };

      // Delete request avec token et gestion de l'erreur
      fetch(`http://${process.env.API_URL}/catways/${catway._id}/reservations/${id}`, {
        method: "DELETE",
        headers: {
          'authorization': `Bearer ${token}`, // Inclusion du tekon dans le header
        }
      })
        .then(response => {
          if (response.ok) {
            return res.redirect('/tableau-de-bord');
          } else {
            return response.json().then(errorData => {
              return res.status(response.status).json(errorData);
            });
          }
        })
        .catch(error => {
          console.error('Error deleting catway:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        });
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
};