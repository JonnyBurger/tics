import bodyParser from 'body-parser';
import cors from 'cors';
import {Router} from 'express';
import pickBy from 'lodash/pickBy';
import {Collection} from 'mongodb';
import ms from 'ms';
import ow from 'ow';
import {asyncHandler} from '../handler';
import {
	getBreakdown,
	getContent,
	getContentEngagementLevel,
	getImpressions,
	getSessions,
	getTotalTimeSpent,
	getUsers,
} from '../methods';
import {Breakdown, Platform, TimeRange, Version} from '../types';

const getDate = (date: TimeRange) => {
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

export default ({db}: {db: Collection}) => {
	const router = Router();
	router.use(cors());
	router.use(bodyParser.json());
	router.get(
		'/stats',
		asyncHandler<
			{},
			{
				activeUsers: {
					daily: number;
					weekly: number;
					monthly: number;
				};
				breakdown: {
					platform: any;
				};
			}
		>(async () => {
			const dailyActiveUsers = await getUsers(db, {
				date: {$gt: Date.now() - ms('1d')},
			});
			const weeklyActiveUsers = await getUsers(db, {
				date: {$gt: Date.now() - ms('7d')},
			});
			const monthlyActiveUsers = await getUsers(db, {
				date: {$gt: Date.now() - ms('30d')},
			});
			const platformBreakdown = await getBreakdown(db, 'platform');
			return {
				activeUsers: {
					daily: dailyActiveUsers,
					weekly: weeklyActiveUsers,
					monthly: monthlyActiveUsers,
				},
				breakdown: {
					platform: platformBreakdown,
				},
			};
		})
	);
	router.get(
		'/query',
		asyncHandler<
			{
				query: {
					date: TimeRange;
					content: string;
					platform: Platform;
					level: string;
					version: Version;
				};
			},
			{
				uniqueUsers: number;
				sessions: number;
				impressions: number;
				totalTimeSpent: number;
				averageSession: number;
			}
		>(async (request) => {
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
				version,
			});
			const uniqueUsers = await getUsers(db, query);
			const sessions = await getSessions(db, query);
			const impressions = await getImpressions(db, query);
			const totalTimeSpent = await getTotalTimeSpent(db, query);
			const averageSession =
				totalTimeSpent === 0
					? 0
					: Math.round(totalTimeSpent / (sessions + impressions));

			return {
				uniqueUsers,
				sessions,
				impressions,
				totalTimeSpent,
				averageSession,
			};
		})
	);
	router.get(
		'/content',
		asyncHandler<{}, {content: string[]}>(async () => {
			const content = await getContent(db);
			return {
				content,
			};
		})
	);
	router.get(
		'/content/:id',
		asyncHandler<
			{
				params: {
					id: string;
				};
			},
			{levels: string[]}
		>(async (request) => {
			const {id} = request.params;
			const levels = await getContentEngagementLevel(db, id);
			return {
				levels,
			};
		})
	);
	router.get(
		'/platforms',
		asyncHandler<{}, {platforms: string[]}>(async () => {
			const platforms = await db.distinct('platform', {});
			return {
				platforms,
			};
		})
	);
	router.get(
		'/versions',
		asyncHandler<{}, {versions: string[]}>(async () => {
			const versions = await db.distinct('version', {});
			return {
				versions,
			};
		})
	);
	router.get(
		'/platforms/breakdown',
		asyncHandler<{}, {platforms: Breakdown}>(async () => {
			const platforms = await getBreakdown(db, 'platform');
			return {
				platforms,
			};
		})
	);
	return router;
};
