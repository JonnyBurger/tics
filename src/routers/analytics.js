const {Router} = require('express');
const bodyParser = require('body-parser');
const ms = require('ms');
const {asyncHandler} = require('../handler');

const getUsers = async (db, query) => {
	const [result] = await db.aggregate(
		[
			query ? {$match: query} : null,
			{$group: {_id: '$identifier'}},
			{$group: {_id: 1, count: {$sum: 1}}}
		].filter(Boolean)
	);
	if (!result) {
		return 0;
	}
	return result.count;
};

module.exports = ({db}) => {
	const router = new Router();
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
			return {
				dailyActiveUsers,
				weeklyActiveUsers,
				monthlyActiveUsers
			};
		})
	);
	return router;
};
