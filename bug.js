const {UserInputError } = require('apollo-server-express');
const {getNextSequenceName,getDB}=require('./db.js')
const { mustBeSignedIn } = require('./auth.js');
const PAGE_SIZE=10;

async function remove(_,{id})
{
  const db=getDB();
  const bug=await db.collection("buggs").findOne({id});
  if(!bug)return false;
  bug.deleted=new Date();
  const res=await db.collection("deleted_Bug").insertOne(bug);
   if(res.insertedId)
   {
     const rst=await db.collection("buggs").removeOne({id});
     return rst.deletedCount==1;
    }
    return false;
  
}

async function get( _,{id})
{
  const db=getDB();
  const bug=await db.collection('buggs').findOne({id});
  return bug;
}

async function list(_,{status,effortMin,search,effortMax,page})
{
  const db=getDB();
  const filter={};

  if(status) filter.status=status;
  if(effortMin!==undefined||effortMax!==undefined)
  {
    filter.effort={};
    filter.effort.$gte=effortMin||0;
    filter.effort.$lte=effortMax||effortMin;
  }
  //const bugs=await db.collection('buggs').find(filter).toArray();
  if(search)filter.$text={$search:search};
  const cursor=await db.collection('buggs').find(filter)
  .sort({id:1})
  .skip(PAGE_SIZE*(page-1))
  .limit(PAGE_SIZE);

    const listCount=await cursor.count(false); 
    const  bugs=cursor.toArray();
    const pages=Math.ceil(listCount/PAGE_SIZE);
  return {bugs,pages};
}
async function counts(_,{status,effortMin,effortMax})
{
  const db=getDB();
  const filter={};
  if(status)filter.status=status;
  if(effortMin!==undefined||effortMax!==undefined)
  {
    filter.effort={}
   if(effortMax!==undefined) filter.effort.$lte=effortMax;
   if(effortMin!==undefined) filter.effort.$gte=effortMin;
  }
  const results=await db.collection('buggs').aggregate([
    {$match:filter},
    {$group:{
      _id:{owner:`$owner`,status:`$status`},
      count:{$sum:1}}}]).toArray();
      const stat={};
     results.forEach((result)=> {
      const {owner,status:statusKey}=result._id;
      if(!stat[owner])stat[owner]={owner};
      stat[owner][statusKey]=result.count;
      })

      return Object.values(stat);
}
async function update(_,{changes,id})
{
  console.log("updatee")
  console.log({...changes})
  const db=getDB();
if(changes.title||changes.status||changes.owner)
{
  const bug=await db.collection('buggs').findOne({id});
  Object.assign(bug,changes);
  validate(bug);
}
await db.collection('buggs').updateOne({id},{$set:changes});
const savedBug =await db.collection('buggs').findOne({id});
return savedBug;
// console.log("updated result"+ savedBug);
}
async function restore(_,{id})
{
  const db=getDB();
  const bug=await db.collection('deleted_Bug').findOne({id});
  if(!bug)return false;
  bug.deleted=new Date();

 let result=await db.collection('buggs').insertOne(bug);
 if(result.insertedId)
 {
 result= await db.collection('deleted_Bug').removeOne({id})
  return result.deletedCount==1;
 }
 
return false;
}

function validate( bug ) {
    const errors = [];
    if (bug.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.')
    }
    if (bug.status === 'Assigned' && !bug.owner) {
    errors.push('Field "owner" is required when status is "Assigned"');
    }
    if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
    }
      
    }

    async function add(_, { bug }) {
      const db=getDB();
        validate(bug);
         bug.created = new Date();
        
     // bug.id =await getNextSequenceName('bugs');
      const result=await db.collection('buggs').insertOne(bug,(err,result)=>{
          if(err)
          MongoClient.close();
      });
    //   const savedBug=await db.collection('buggs').findOne({_id:result.insertId});
    //   return savedBug;
         if (bug.status === undefined) bug.status = 'New';
       //  issuesDB.push(bug);
         return bug;
         }

         module.exports = {
          list,
          add:mustBeSignedIn(add),
          get,
          update:mustBeSignedIn(update),
          delete:mustBeSignedIn(remove),
          restore:mustBeSignedIn(restore),
          counts,
          };