import {Collection} from 'mongodb';

import ms from 'ms';
import impressionRouter from './routers/impressions';
import analyticsRouter from './routers/analytics';
import {
	getUsers,
	getBreakdown,
	getActivityLevels,
	getActivityLevelsById
} from './methods';

export default ({db}: {db: Collection}) => {
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
		breakDown: (field: string) => getBreakdown(db, field),
		activityLevels: {
			byContentType: (content: string) => getActivityLevels(db, content),
			byContentId: (content_id: string) => getActivityLevelsById(db, content_id)
		},
		db
	};
	return {impressions, analytics, stats};
};
