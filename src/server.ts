const ms = require('ms');
const impressionRouter = require('./routers/impressions');
const analyticsRouter = require('./routers/analytics');
const {
	getUsers,
	getBreakdown,
	getActivityLevels,
	getActivityLevelsById
} = require('./methods');

module.exports = ({db}) => {
	const impressions = impressionRouter({db});
	const analytics = analyticsRouter({db});
	const stats = {
		dau: () =>
			getUsers(db, {
				date: {$gt: Date.now() - ms('1d')}
			}),
		wau: () =>
			getUsers(db, {
				date: {$gt: Date.now() - ms('7d')}
			}),
		mau: () =>
			getUsers(db, {
				date: {$gt: Date.now() - ms('30d')}
			}),
		userCount: (query = {}) => {
			getUsers(db, query);
		},
		platforms: () => getBreakdown(db, 'platform'),
		languages: () => getBreakdown(db, 'language'),
		versions: () => getBreakdown(db, 'version'),
		contents: () => getBreakdown(db, 'content'),
		breakDown: field => getBreakdown(db, field),
		activityLevels: {
			byContentType: content => getActivityLevels(db, content),
			byContentId: content_id => getActivityLevelsById(db, content_id)
		},
		db
	};
	return {impressions, analytics, stats};
};
