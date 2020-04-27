import test, {TestInterface} from 'ava';
import express from 'express';
import getPort from 'get-port';
import got from 'got';
import sortBy from 'lodash/sortBy';
import {MongoClient} from 'mongodb';
import {MongoMemoryServer} from 'mongodb-memory-server';
import pify from 'pify';
import tics from '../server';

type Context = {
	port: number;
	dbName: string;
	dbUrl: string;
	stop: () => void;
	db: MongoClient;
	api: string;
	stats: any;
};

const myTest = test as TestInterface<Context>;

myTest.beforeEach(
	async (t): Promise<void> => {
		const port = await getPort();
		const app = express();
		const mongod = new MongoMemoryServer();

		t.context.port = port;
		t.context.dbName = await mongod.getDbName();
		t.context.dbUrl = await mongod.getUri();
		t.context.stop = (): Promise<boolean> => mongod.stop();
		t.context.db = await MongoClient.connect(t.context.dbUrl, {
			useNewUrlParser: true,
		});
		t.context.api = `http://localhost:${t.context.port}`;
		const {impressions, analytics, stats} = tics({
			db: t.context.db.db(t.context.dbName).collection('impressions'),
		});
		t.context.stats = stats;
		app.use('/analytics', analytics);
		app.use('/telemetry', impressions);
		await pify(app.listen.bind(app))(port);
	}
);

const sendImpression = (api: string, body: string): Promise<any> => {
	return got
		.post(`${api}/telemetry/impression`, {
			body,
			headers: {
				'Content-Type': 'application/json',
			},
		})
		.json();
};

const updateImpression = (
	api: string,
	id: string,
	body: string
): Promise<any> => {
	return got
		.patch(`${api}/telemetry/impression/${id}`, {
			body,
			headers: {
				'Content-Type': 'application/json',
			},
		})
		.json();
};

const getStats = (api: string): Promise<any> => {
	return got(`${api}/analytics/stats`).json();
};

myTest(
	'Should validate request',
	async (t): Promise<void> => {
		try {
			await sendImpression(
				t.context.api,
				JSON.stringify({
					identifier: {
						shouldNotBeObject: 'string',
					},
				})
			);
			t.fail();
		} catch (err) {
			t.true(err.message.includes('400'));
		}
	}
);

myTest('Should accept correct body', async (t) => {
	const response = await sendImpression(
		t.context.api,
		JSON.stringify({
			identifier: '42037594395',
			content: 'login',
			level: 'click',
		})
	);
	t.true(response.success);
});

myTest(
	'Should successfully add an impression',
	async (t): Promise<void> => {
		const response = await sendImpression(
			t.context.api,
			JSON.stringify({
				identifier: '48239740923',
				content: 'login',
				level: 'click',
			})
		);
		t.true(response.success);
		t.is(response.data.impression._id.length, 24);
		const count = await t.context.db
			.db(t.context.dbName)
			.collection('impressions')
			.countDocuments();
		t.is(count, 1);
	}
);

myTest(
	'Two impressions by the same user should count as 1 user',
	async (t): Promise<void> => {
		for (let i = 0; i < 2; i++) {
			await sendImpression(
				t.context.api,
				JSON.stringify({
					identifier: '48239740923',
					content: 'login',
					level: 'click',
				})
			);
		}
		const stats = await getStats(t.context.api);
		t.is(stats.data.activeUsers.daily, 1);
	}
);

myTest(
	'Should be able to bisect Android and iOS users',
	async (t): Promise<void> => {
		await sendImpression(
			t.context.api,
			JSON.stringify({
				identifier: '47389247',
				content: 'login',
				level: 'click',
				platform: 'ios',
			})
		);
		await sendImpression(
			t.context.api,
			JSON.stringify({
				identifier: '482379749832',
				content: 'login',
				level: 'click',
				platform: 'android',
			})
		);
		const stats = await getStats(t.context.api);
		t.deepEqual(
			sortBy(stats.data.breakdown.platform, (p: any): string => p.id),
			[
				{
					id: 'android',
					count: 1,
				},
				{
					id: 'ios',
					count: 1,
				},
			]
		);
		t.pass();
	}
);

myTest(
	'Should be able to breakdown installs and registers',
	async (t): Promise<void> => {
		await sendImpression(
			t.context.api,
			JSON.stringify({
				identifier: '123456789',
				content: 'register',
				level: 'install',
				platform: 'ios',
			})
		);
		await sendImpression(
			t.context.api,
			JSON.stringify({
				identifier: '123456789',
				content: 'register',
				level: 'register',
				platform: 'ios',
			})
		);
		const types = await t.context.stats.activityLevels.byContentType(
			'register'
		);
		t.deepEqual(
			sortBy(types, (_t: any): string => _t.id),
			[
				{
					id: 'install',
					count: 1,
				},
				{
					id: 'register',
					count: 1,
				},
			]
		);
	}
);

myTest(
	'Should not be able to update an impression that does not exist',
	async (t): Promise<void> => {
		try {
			await updateImpression(
				t.context.api,
				'5be9d22ec0f7f9280fe7beb3',
				JSON.stringify({
					identifier: '123456789',
				})
			);
			t.fail();
		} catch (err) {
			t.true(err.message.includes('404'));
		}
	}
);

myTest(
	'Should not be able to update an impression that has a different identifier',
	async (t): Promise<void> => {
		const response = await sendImpression(
			t.context.api,
			JSON.stringify({
				identifier: '123456789',
				content: 'register',
				level: 'install',
				platform: 'ios',
			})
		);
		try {
			await updateImpression(
				t.context.api,
				response.data.impression._id,
				JSON.stringify({
					identifier: '987654321',
				})
			);
			t.fail();
		} catch (err) {
			t.true(err.message.includes('400'));
		}
	}
);

myTest(
	'Should be able to update an impression with correct parameters',
	async (t): Promise<void> => {
		const response = await sendImpression(
			t.context.api,
			JSON.stringify({
				identifier: '123456789',
				content: 'register',
				level: 'install',
				platform: 'ios',
			})
		);
		const body = await updateImpression(
			t.context.api,
			response.data.impression._id,
			JSON.stringify({
				identifier: '123456789',
			})
		);
		t.truthy(body.data.impression.lastUpdated);
		t.truthy(body.data.impression.date);
		t.true(body.data.impression.lastUpdated > body.data.impression.date);
	}
);
