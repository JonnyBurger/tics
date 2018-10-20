import test from 'ava';
import express from 'express';
import got from 'got';
import getPort from 'get-port';
import pify from 'pify';
import mongo from 'then-mongo';
import tics from '../src';
import {create, destroy} from './helpers/db-mock';

test.beforeEach(async t => {
	const [dbName, userName] = await create();
	const port = await getPort();
	const app = express();
	t.context.port = port;
	t.context.dbName = dbName;
	t.context.dbUrl = `mongodb://${userName}:test@localhost:27017/${dbName}`;
	t.context.db = mongo(t.context.dbUrl, ['impressions']);
	t.context.api = `http://localhost:${t.context.port}`;
	const {impressions, analytics} = tics({
		db: t.context.db.impressions
	});
	app.use('/analytics', analytics);
	app.use('/telemetry', impressions);
	await pify(app.listen.bind(app))(port);
});

test.afterEach.always(async t => {
	await destroy(t.context.dbName);
});

const sendImpression = (api, body) => {
	return got.post(`${api}/telemetry/impression`, {
		body,
		headers: {
			'Content-Type': 'application/json'
		},
		json: true
	});
};

const getStats = api => {
	return got(`${api}/analytics/stats`, {
		json: true
	});
};

test('Should validate request', async t => {
	try {
		await sendImpression(t.context.api, {
			identifier: {
				shouldNotBeObject: 'string'
			}
		});
		t.fail();
	} catch (err) {
		t.is(400, err.statusCode);
	}
});

test('Should accept correct body', async t => {
	const response = await sendImpression(t.context.api, {
		identifier: '42037594395',
		content: 'login',
		level: 'click'
	});
	t.true(response.body.success);
	t.is(200, response.statusCode);
});

test('Should successfully add an impression', async t => {
	const response = await sendImpression(t.context.api, {
		identifier: '48239740923',
		content: 'login',
		level: 'click'
	});
	t.true(response.body.success);
	const count = await t.context.db.impressions.count();
	t.is(count, 1);
});

test('Two impressions by the same user should count as 1 user', async t => {
	for (let i = 0; i < 2; i++) {
		await sendImpression(t.context.api, {
			identifier: '48239740923',
			content: 'login',
			level: 'click'
		});
	}
	const stats = await getStats(t.context.api);
	t.is(stats.body.data.dailyActiveUsers, 1);
});
