const {Router} = require('express');
const ow = require('ow');
const bodyParser = require('body-parser');
const {pickBy} = require('lodash');
const cors = require('cors');
const ms = require('ms');
const {asyncHandler} = require('../handler');
const {
	getUsers,
	getBreakdown,
	getContent,
	getSessions,
	getTotalTimeSpent,
	getContentEngagementLevel
} = require('../methods');

const getDate = date => {
	if (date === 'yearly') {
		return {$gt: Date.now() - ms('1y')};
	}
	if (date === 'monthly') {
		return {$gt: Date.now() - ms('30d')};
	}
	if (date === 'weekly') {
		return {$gt: Date.now() - ms('7d')};
	}
	if (date === 'daily') {
		return {$gt: Date.now() - ms('1d')};
	}
	if (date === 'hourly') {
		return {$gt: Date.now() - ms('1h')};
	}
	return null;
};

module.exports = ({db}) => {
	const router = new Router();
	router.use(cors());
	router.use(bodyParser.json());
	router.get(
		'/stats',
		asyncHandler(async () => {
			const dailyActiveUsers = await getUsers(db, {
				date: {$gt: Date.now() - ms('1d')}
			});
			const weeklyActiveUsers = await getUsers(db, {
				date: {$gt: Date.now() - ms('7d')}
			});
			const monthlyActiveUsers = await getUsers(db, {
				date: {$gt: Date.now() - ms('30d')}
			});
			const platformBreakdown = await getBreakdown(db, 'platform');
			return {
				activeUsers: {
					daily: dailyActiveUsers,
					weekly: weeklyActiveUsers,
					monthly: monthlyActiveUsers
				},
				breakdown: {
					platform: platformBreakdown
				}
			};
		})
	);
	router.get(
		'/query',
		asyncHandler(async request => {
			const {date, content, platform, level, version} = request.query;
			ow(date, ow.any(ow.string, ow.nullOrUndefined));
			ow(content, ow.any(ow.string, ow.nullOrUndefined));
			ow(platform, ow.any(ow.string, ow.nullOrUndefined));
			ow(level, ow.any(ow.string, ow.nullOrUndefined));
			ow(version, ow.any(ow.string, ow.nullOrUndefined));
			const query = pickBy({
				date: getDate(date),
				content,
				platform,
				level,
				version
			});
			const uniqueUsers = await getUsers(db, query);
			const sessions = await getSessions(db, query);
			const totalTimeSpent = await getTotalTimeSpent(db, query);
			const averageSession =
				totalTimeSpent === 0 ? 0 : Math.round(totalTimeSpent / sessions);

			return {
				uniqueUsers,
				sessions,
				totalTimeSpent,
				averageSession
			};
		})
	);
	router.get(
		'/content',
		asyncHandler(async () => {
			const content = await getContent(db);
			return {
				content
			};
		})
	);
	router.get(
		'/content/:id',
		asyncHandler(async request => {
			const {id} = request.params;
			const levels = await getContentEngagementLevel(db, id);
			return {
				levels
			};
		})
	);
	router.get(
		'/platforms',
		asyncHandler(async () => {
			const platforms = await db.distinct('platform');
			return {
				platforms
			};
		})
	);
	router.get(
		'/versions',
		asyncHandler(async () => {
			const versions = await db.distinct('version');
			return {
				versions
			};
		})
	);
	router.get(
		'/platforms/breakdown',
		asyncHandler(async () => {
			const platforms = await getBreakdown(db, 'platform');
			return {
				platforms
			};
		})
	);
	return router;
};
