import randomstring from 'randomstring';
import {MongoClient} from 'mongodb';

export const create = async () => {
	const dbName = 'test_' + randomstring.generate(5);
	const userName = 'test_user' + randomstring.generate(5);
	await new Promise((resolve, reject) => {
		MongoClient.connect(
			'mongodb://localhost:27017',
			{
				useNewUrlParser: true
			},
			(err, client) => {
				if (err) {
					return reject(err);
				}
				client.db(dbName).addUser(
					userName,
					'test',
					{
						roles: [{role: 'readWrite', db: dbName}]
					},
					err => {
						if (err) {
							return reject(err);
						}
						resolve();
					}
				);
			}
		);
	});
	return [dbName, userName];
};

const drop = (client, name) => {
	return new Promise((resolve, reject) => {
		client.db(name).dropDatabase((err, success) => {
			if (err) {
				reject(err);
			} else {
				resolve(success);
			}
		});
	});
};

export const destroy = async dbName => {
	await new Promise((resolve, reject) => {
		MongoClient.connect(
			'mongodb://localhost:27017',
			{
				useNewUrlParser: true
			},
			(err, client) => {
				if (err) {
					return reject(err);
				}
				client
					.db(dbName)
					.executeDbAdminCommand({listDatabases: 1}, (err, dbNames) => {
						if (err) {
							return reject(err);
						}
						const dbsToDelete = dbNames.databases
							.map(db => db.name)
							.filter(n => n.match(/test_/));
						// eslint-disable-next-line promise/no-promise-in-callback
						Promise.all(dbsToDelete.map(db => drop(client, db)))
							.then(resolve)
							.catch(reject);
					});
			}
		);
	});
};
