const express = require('express')
      , session = require('express-session')
      , passport = require('passport')
      , strategy = require(`${__dirname}/strategy.js`)
      , request = require('request')
      , cors = require('cors');

const app = express();


app.use( session({
  secret: '@nyth!ng y0u w@nT',
  resave: false,
  saveUninitialized: true
}));


app.use( passport.initialize() )
app.use( passport.session() )

passport.use( strategy )

passport.serializeUser( function( user, done ) {
  const { _json } = user
  
  done( null, { clientID: _json.clientID, email: _json.email, name: _json.name, followers: _json.followers_url })
})

passport.deserializeUser( function( obj, done ) {
  done( null, obj )
})

app.get( '/login', passport.authenticate( 'auth0', {
  successRedirect: '/followers',
  failureRedirect: '/login',
  failureFlash: true,
  connection: 'github'
}) )

app.get('/followers', ( req, res, next ) => {
  if ( req.user ) {
    const FollowersRequest = {
      url: req.user.followers,
      headers: {
        'User-Agent': req.user.clientID
      }
    };
    
    request( FollowersRequest, ( error, response, body ) => {
      res.status( 200 ).send( body )
    })
  } else {
    res.redirect( '/login' )
  }
})

const port = 3000;
app.listen( port, () => { console.log(`Server listening on port ${port}`); } );