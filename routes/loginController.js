'use strict';

const { Usuario } = require('../models');

class LoginController {
  index(req, res, next) {
    res.locals.error = '';
    res.locals.email = '';
    res.render('login');
  }

  async post(req, res, next) {
    try {
      const { email, password } = req.body;
      console.log(email, password);

      const usuario = await Usuario.findOne({ email });

      if (!usuario || !(await usuario.comparePassword(password))) {
        res.locals.error = 'Invalid credentials';
        res.locals.email = email;
        res.render('login');
        return;
      }

      res.redirect('/apiv1/anuncios');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LoginController;
