const fs=require('fs')
const GraphQLDate=require('./Graphql-date');
const about=require('./about.js')
const bug=require('./bug.js');
const auth = require('./auth.js');
const { ApolloServer,UserInputError } = require('apollo-server-express');


const resolvers = {
    Query: {
    about: () => about.getMessage,
    bugList:bug.list,
    bug:bug.get,
    bugCounts:bug.counts
    },
    Mutation: {
   setAboutMessage: about.setMessage,
    bugAdd:bug.add,
    bugUpdate:bug.update,
    bugDelete:bug.delete,
    bugRestore:bug.restore
    },
    GraphQLDate,
    };
    function getContext({ req }) {
        const user = auth.getUser(req);
        return { user };
        }
const server = new ApolloServer({
    typeDefs:fs.readFileSync('./schema.graphql','utf-8'),
    resolvers,
    context:getContext,
    playground:true,
    introspection:true,
    formatError: error => {
        console.log(error);
        return error;
        },
    });

function installHandler(app)
{
    const enableCors=(process.env.ENABLE_CORS||'true')=='true';
    var cors;
    if (enableCors) {
        const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:5000';
        const methods = 'POST';
        cors = { origin, methods, credentials: true };
        } else {
        cors = 'false';
        }
    server.applyMiddleware({ app, path: '/graphql',cors});
 

}

module.exports={installHandler}