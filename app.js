const express = require('express');
const app = express();
const axios = require('axios');
const qs = require('qs');
const cors = require("cors");
require('dotenv').config()

//app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());




app.get('/token', async function(req, res, next){
  try{
    const apiKey = req.headers['x-api-key']; // Look for the key in headers
    const validApiKey = process.env.LOCAL_API_KEY; // Your predefined key in env file

    if (apiKey !== validApiKey) {
      return res.status(403).send({ error: 'Forbidden: Invalid API Key' });
    }
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


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});


