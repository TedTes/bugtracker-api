const MongoClient=require('mongodb').MongoClient;
require('dotenv').config();
console.log(process.env.DB_URL)
const url=process.env.DB_URL||'mongodb+srv://Tedros:drowssap&321@bugtracker-69156.mongodb.net/bugtracker?retryWrites=true&w=majority'
var db;

 async function connectToDB()
 {

    MongoClient.connect(url, (err, client) => {
        db = client.db('bugtracker');
    });

}

async function getNextSequenceName(name)
{
    result=await db.collection('counters').findOneAndUpdate(
        {_id:name},
        {$inc:{current:1}},
        {returnOriginal:false},
      );
      return result.value.current;
       
    // const result=await db.counters.findAndModify({
    //     query:{_id:name},
    //     update:{$inc:{current:1}},
    //     new:true
    // })
    //   return result.current;
}

function getDB()
{
    return db;
}
 
module.exports={getNextSequenceName,getDB,connectToDB}