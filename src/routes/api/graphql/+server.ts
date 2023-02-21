import { useGraphQlJit } from '@envelop/graphql-jit';
import { createYoga, createSchema } from 'graphql-yoga';
import type { RequestEvent } from '@sveltejs/kit';
import { renderGraphiQL } from '@graphql-yoga/render-graphiql';
import { mysqlconnFn } from '$lib/db/connection';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';

const yogaApp = createYoga<RequestEvent>({
	logging: false,
	schema: createSchema({
		typeDefs: `
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

          type Message {
            message: String
          }
          type Mutation {
            generatePDF: Message
          }
          
		`,
		resolvers: {
			Query: {
				// Get all persons
				persons: async () => {
					let connection = await mysqlconnFn();
					const [rows, fields] = await connection.query('SELECT * FROM users');
					//console.log(rows);
					return rows;
				}
			},
			Mutation: {
				createPerson: async (_, { name, age, email, complete }) => {
					const id = uuidv4();
					try {
						const connection = await mysqlconnFn();
						const result = await connection.query(
							'INSERT INTO users (id, name, email, age, complete) VALUES (?, ?, ?, ?, ?)',
							[id, name, email, age, complete]
						);
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
						// @ts-ignore
						return { success: result.affectedRows > 0 };
					} catch (error) {
						console.error(error);
						return { success: false };
					}
				},
				updatePerson: async (parent, { id, complete }, args) => {
					try {
						const connection = await mysqlconnFn();
						const result = await connection.query('UPDATE users SET complete = ? WHERE id = ?', [
							complete,
							id
						]);
						// Retrieve the updated person record
						const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
						// @ts-ignore
						return rows[0]; // Return the first row of the query result (i.e., the updated person record)
					} catch (error) {
						console.error(error);
						return null;
					}
				},

				generatePDF: async () => {
					let connection = await mysqlconnFn();
					// query the database
					const [rows, fields] = await connection.execute('SELECT * FROM users');
					// write the query results to a JSON file
					await writeFile('data.json', JSON.stringify({ rows }));

					// close the MySQL connection pool
					// await connection.end();

					// return a success message

					try {
						await new Promise((resolve, reject) => {
							exec(
								`jsreport render --template.content=src/lib/sample.html --template.engine=handlebars --data=data.json --template.recipe=chrome-pdf --out=src/lib/new.pdf`,
								(error, stdout, stderr) => {
									if (error) {
										console.error(`exec error: ${error}`);
										reject(error);
									} else {
										console.log(`stdout: ${stdout}`);
										console.error(`stderr: ${stderr}`);
										// @ts-ignore
										resolve();
									}
								}
							);
						});

						return { message: 'src/lib/new.pdf' };
					} catch (error) {
						// @ts-ignore
						throw new Error(error.message);
					}
				}
			}
		}
	}),
	plugins: [
		useGraphQlJit()
		// other plugins: https://www.envelop.dev/plugins
	],
	cors: {
		origin: '*',
		credentials: true,
		methods: ['GET', 'POST', 'OPTIONS']
	},
	graphqlEndpoint: '/api/graphql',
	renderGraphiQL,
	graphiql: {
		defaultQuery: `query Hello {
	hello
}`
	},
	fetchAPI: globalThis
});

export { yogaApp as GET, yogaApp as POST };
