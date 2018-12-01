const {Router} = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ms = require('ms');
const {asyncHandler} = require('../handler');
const {getUsers, getBreakdown} = require('../methods');

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
	return router;
};
