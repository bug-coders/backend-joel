'use strict';

const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');

class LoginController {
  index(req, res, next) {
    res.locals.error = '';
    res.locals.email = '';
    res.render('login');
  }

  async post(req, res, next) {
    try {
      const { email, password } = req.body;

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

  async JWTpost(req, res, next) {
    try {
      const { email, password } = req.body;

      const usuario = await Usuario.findOne({ email });

      if (!usuario || !(await usuario.comparePassword(password))) {
        res.status(401);
        res.json({ error: 'Invalid credentials' });
        return;
      }

      const JWTtoken = jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET, {
        expiresIn: '2d',
      });
      res.json(JWTtoken);
    } catch (error) {
      next(error);
    }
  }

  logout(req, res, next) {
    res.redirect('/');
  }
}

module.exports = LoginController;
