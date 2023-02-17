import { useGraphQlJit } from '@envelop/graphql-jit';
import { createYoga, createSchema } from 'graphql-yoga';
import type { RequestEvent } from '@sveltejs/kit';
import { renderGraphiQL } from '@graphql-yoga/render-graphiql';
import { mysqlconnFn  } from '$lib/db/connection';
import { v4 as uuidv4 } from 'uuid';


// Sample dummy JSON data
let users = [
    { id: 1, name: 'Alice', age: 25, email: 'alice@example.com', complete: true},
    { id: 2, name: 'Bob', age: 30, email: 'bob@example.com', complete: false }
  ];

const yogaApp = createYoga<RequestEvent>({
	logging: false,
	schema: createSchema({
        typeDefs: `
        type User {
            id: Int!
            name: String!
            email: String!
            age: Int!
            complete: Boolean!
          }
          type Query {
            users: [User!]!
          }
          type Mutation {
            createUser(name: String!, email: String!, age: Int!, complete: Boolean!): User!
            updateUser(id: Int!, complete: Boolean!): User!
            deleteUser(id: Int!): User
          }

          type Persons {
            id: String!
            name: String!
            email: String!
            age: Int!
            complete: Boolean!
          }
          type Query {
            persons: [Persons!]!
          }
          type Mutation {
            createPerson(name: String!, email: String!, age: Int!, complete: Boolean!): Persons!
            updatePerson(id: String!, complete: Boolean!): Persons!
            deletePerson(id: String!): Persons
          }
          
		`,
		resolvers: {
            Query: {

              users: () => {
                 //console.log(users)
                 return users;
              },
               // Get all persons
              persons: async () => {  
                  let connection = await mysqlconnFn();
                  const [rows,fields] = await connection.query('SELECT * FROM users');
                  //console.log(rows);
                  return rows
              },
            },
            Mutation: {
                createUser: (_, { name, age, email, complete }) => {
                  const newUser = { id: users.length + 1, name, age, email, complete };
                  users.push(newUser);
                  return newUser;
                },
                deleteUser: (parent, args, context, inf) => {
                    const id = args.id;
                    users = users.filter((user) => user.id !== id);
                    console.log(`User with id ${id} deleted.`);
                    return id;
                  },
                updateUser: (parent, args) => {
                    const userIndex = users.findIndex(user => user.id === args.id);
                    if (userIndex === -1) {
                      throw new Error('User not found');
                    }                    
                    const user = {
                      ...users[userIndex],
                      ...args,
                    };
                    users[userIndex] = user;
                    return user;
                  },
                
                
                createPerson: async (_, { name, age, email, complete }) => {
                    const id = uuidv4();
                    try {
                      const connection = await mysqlconnFn();
                      const result = await connection.query('INSERT INTO users (id, name, email, age, complete) VALUES (?, ?, ?, ?, ?)', [id, name, email, age, complete]);
                      // Retrieve the newly created person record
                      return { id, name, email, age, complete };
                    } catch (error) {
                      console.error(error);
                      return null;
                    }
                  },
                deletePerson: async (parent, { id }) => {
                    try {
                      const connection = await mysqlconnFn();
                      const result = await connection.query('DELETE FROM users WHERE id = ?', [id]);
                      return { success: result.affectedRows > 0 };
                    } catch (error) {
                      console.error(error);
                      return { success: false };
                    }
                  },
                updatePerson: async (parent, { id, complete }, args) => {
                  try {
                    const connection = await mysqlconnFn();
                    const result = await connection.query('UPDATE users SET complete = ? WHERE id = ?', [complete, id]);
                    // Retrieve the updated person record
                    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
                    return rows[0]; // Return the first row of the query result (i.e., the updated person record)
                  } catch (error) {
                    console.error(error);
                    return null;
                  }
                  },
              }
          }
	}),
	plugins: [
		useGraphQlJit()
		// other plugins: https://www.envelop.dev/plugins
	],
	graphqlEndpoint: '/api/graphql',
	renderGraphiQL,
	graphiql: {
		defaultQuery: `query Hello {
	hello
}`
	},
	fetchAPI: globalThis,
});

export { yogaApp as GET, yogaApp as POST };

