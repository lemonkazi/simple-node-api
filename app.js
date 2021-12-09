const express = require('express');
const app = express();
const axios = require('axios');
const qs = require('qs');
const cors = require("cors");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());




app.get('/token', async function(req, res, next){
  try{

    const client_id = '72ba43dc1ccc4afdbd8c693f0bee8068'; // Your client id
    const client_secret = '72e14164906a49749bf1773ae9ae0e61'; // Your secret
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


const port = 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});


