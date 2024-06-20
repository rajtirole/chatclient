// app.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const intercom = require('intercom-client');
const dotenv=require('dotenv').config()


const app = express();

// Configurations and middleware
app.use(session({ secret: 'SECRET_KEY', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.Client_Id,
  clientSecret: '',
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Save user to database
  done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
 
// Intercom Client
const intercomClient = new intercom.Client({ token: process.env.INTERCOM_KEY });

// API endpoints
app.post('/api/submit-request', (req, res) => {
  const { category, comments } = req.body;
  // Submit request to Intercom
  intercomClient.messages.create({
    from: { type: 'user', id: req.user.id },
    body: comments,
    message_type: 'inbox'
  }).then(() => {
    res.send({ success: true });
  }).catch(err => {
    res.status(500).send({ error: err.message });
  });
});

app.get('/api/requests/:category', (req, res) => {
  const category = req.params.category;
  // Fetch requests by category
  intercomClient.messages.list({}).then(messages => {
    const filteredMessages = messages.filter(message => message.category === category);
    res.send(filteredMessages);
  }).catch(err => {
    res.status(500).send({ error: err.message });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
