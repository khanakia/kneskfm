const express = require('express');
// const {  graphqlExpress, graphiqlExpress, ApolloServer, gql } = require('apollo-server-express');
const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => 'Hello world!',
};

class SA_Graphql {
    constructor() {
        const _config = require('./config')
        this.config = Object.assign({}, _config, App.config.graphql||{});
        // this.schemas = [
        //     this.helloSchema()
        // ]       
        
        // let server = new ApolloServer({schema : this.helloSchema()});

        App.Hook.Action.add('Www/Init', async (args) => {
            // server.applyMiddleware({ app : Sapp['Core/Www'].app });
            console.log('GQL WWW INIT')
            App.plugins['Core/Www'].app.use(
                '/graphql',
                graphqlHTTP({
                  schema: schema,
                  rootValue: root,
                  graphiql: true, 
                }),
              );
        })

        // this.server = server
    }

    helloSchema() {
        const typeDefs = gql`
            type Query {
                hello: String
            }
            `;

            // Provide resolver functions for your schema fields
        const resolvers = {
            Query: {
                hello: () => 'Hello world11!',
            },
        };

        const schema = makeExecutableSchema({
            typeDefs: typeDefs,
            resolvers: resolvers
        });

        return schema
    }

    addSchema(schemaNew) {
        const schema = mergeSchemas({
            schemas: [
                ...this.schemas,
                schemaNew
            ],
            // resolvers: resolvers2
          });

        this.server.schema = schema
    }


    async init() {
        console.debug('SA_Graphql Init')
        
        // await Sapp['Core/Hook'].Action.do('Graphql/Init')

        // const typeDefs = gql`
        //     type Query {
        //         hello2: String
        //     }
        //     `;

        //     // Provide resolver functions for your schema fields
        // const resolvers = {
        //     Query: {
        //         hello2: () => 'Hello world!',
        //     },
        // };

        // const schema2 = makeExecutableSchema({
        //     typeDefs: typeDefs,
        //     resolvers: resolvers
        // });
        


          
        // const server = new ApolloServer({ schema: schema });
        // const app = express();
        // server.applyMiddleware({ app : Sapp.Www.app });
    }

}
module.exports = SA_Graphql