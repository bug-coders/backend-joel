'use strict';

const mongoose = require('mongoose');
require('../models/Usuario.js');

const Usuario = mongoose.model('Usuario');
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

      res.redirect('/');
    } catch (error) {
      next(error);
    }
  }

  async JWTpost(req, res, next) {
    try {
      const { email, password } = req.body;

      const userData = await Usuario.findOne({ email });

      if (!userData || !(await userData.comparePassword(password))) {
        res.status(401);
        res.json({ error: 'Invalid credentials' });
        return;
      }

      const user = { _id: userData._id, name: userData.name, email: userData.email };

      const JWTtoken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '2d',
      });
      res.json({ JWTtoken, user });
    } catch (error) {
      next(error);
    }
  }

  logout(req, res, next) {
    res.redirect('/');
  }
}

module.exports = LoginController;
