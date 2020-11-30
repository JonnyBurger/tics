import {MongoClient} from 'mongodb';
import randomstring from 'randomstring';

export const create = async (): Promise<[string, string]> => {
	const dbName = 'test_' + randomstring.generate(5);
	const userName = 'test_user' + randomstring.generate(5);
	await new Promise<void>((resolve, reject): void => {
		MongoClient.connect(
			'mongodb://localhost:27017',
			{
				useNewUrlParser: true,
			},
			(err, client): void => {
				if (err) {
					return reject(err);
				}
				client.db(dbName).addUser(
					userName,
					'test',
					{
						roles: [{role: 'readWrite', db: dbName}],
					},
					(err2: Error): void => {
						if (err2) {
							return reject(err2);
						}
						resolve();
					}
				);
			}
		);
	});
	return [dbName, userName];
};

const drop = (client: any, name: string): Promise<boolean> => {
	return new Promise((resolve, reject): void => {
		client.db(name).dropDatabase((err: Error, success: boolean): void => {
			if (err) {
				reject(err);
			} else {
				resolve(success);
			}
		});
	});
};

export const destroy = async (dbName: string): Promise<void> => {
	await new Promise((resolve, reject): void => {
		MongoClient.connect(
			'mongodb://localhost:27017',
			{
				useNewUrlParser: true,
			},
			(err, client): any => {
				if (err) {
					return reject(err);
				}
				client
					.db(dbName)
					.executeDbAdminCommand(
						{listDatabases: 1},
						(err2: Error, dbNames): any => {
							if (err2) {
								return reject(err2);
							}
							const dbsToDelete = dbNames.databases
								.map((db: any): string => db.name)
								.filter((n: string): boolean => Boolean(n.match(/test_/)));
							// eslint-disable-next-line promise/no-promise-in-callback
							Promise.all(
								dbsToDelete.map((db: any): Promise<boolean> => drop(client, db))
							)
								.then(resolve)
								.catch(reject);
						}
					);
			}
		);
	});
};
