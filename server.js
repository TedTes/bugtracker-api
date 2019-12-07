const express = require('express');
const {installHandler}=require('./api-handler.js')
const {connectToDB}=require('./db.js')
const auth=require('./auth.js');
const cookieParser=require('cookie-parser');
 const MongoClient=require('mongodb').MongoClient;
// console.log(process.env.DB_URL)
require('dotenv').config();

const app = express();

 app.use(cookieParser());
 app.use('/auth',auth.routes);

installHandler(app);
app.use(express.static('public'));
app.get('/',(req,res)=>{res.send("hello from backend")})
const port=process.env.PORT||4000;
(async function() { try{
    await connectToDB();
    app.listen(port, function () {
        console.log('App started on port 4000');
        });
    }
    catch(e){ console.log('ERROR:',e);}
})()



