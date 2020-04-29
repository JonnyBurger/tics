import {Collection} from 'mongodb';
import ms from 'ms';
import {
	getActivityLevels,
	getActivityLevelsById,
	getBreakdown,
	getUsers,
} from './methods';
import analyticsRouter from './routers/analytics';
import impressionRouter from './routers/impressions';
import {Breakdown} from './types';

export const server = ({db}: {db: Collection}): any => {
	const impressions = impressionRouter({db});
	const analytics = analyticsRouter({db});
	const stats = {
		dau: (): Promise<number> =>
			getUsers(db, {
				date: {$gt: Date.now() - ms('1d')},
			}),
		wau: (): Promise<number> =>
			getUsers(db, {
				date: {$gt: Date.now() - ms('7d')},
			}),
		mau: (): Promise<number> =>
			getUsers(db, {
				date: {$gt: Date.now() - ms('30d')},
			}),
		userCount: (query = {}): Promise<number> => {
			return getUsers(db, query);
		},
		platforms: (): Promise<Breakdown> => getBreakdown(db, 'platform'),
		languages: (): Promise<Breakdown> => getBreakdown(db, 'language'),
		versions: (): Promise<Breakdown> => getBreakdown(db, 'version'),
		contents: (): Promise<Breakdown> => getBreakdown(db, 'content'),
		breakDown: (field: string): Promise<Breakdown> => getBreakdown(db, field),
		activityLevels: {
			byContentType: (content: string): Promise<any> =>
				getActivityLevels(db, content),
			byContentId: (content_id: string): Promise<any> =>
				getActivityLevelsById(db, content_id),
		},
		db,
	};
	return {impressions, analytics, stats};
};

export default server;
