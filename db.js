const {MongoClient}=require('mongodb');
require('dotenv').config();

const url=process.env.DB_URL||'mongodb://localhost:27017/bugtracker'

var db;
async function connectToDB()
{
    MongoClient.connect(url,function(err,database){
        if(err)
        console.log(err);
        db=database;
    });
//     const client=new MongoClient(url,{useNewUrlParser:true});
//    await client.connect();
//    console.log('connect to Db at',url);
//    db=client.db;
}

async function getNextSequenceName(name)
{
    console.log("hello world colelctioins")
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