import {Collection} from 'mongodb';
import {PlainObject, Breakdown} from './types';

export const getUsers = async (
	db: Collection,
	query?: PlainObject
): Promise<number> => {
	const [result] = await db
		.aggregate(
			[
				query ? {$match: query} : {},
				{$group: {_id: '$identifier'}},
				{$group: {_id: 1, count: {$sum: 1}}}
			].filter(Boolean)
		)
		.toArray();
	if (!result) {
		return 0;
	}
	return result.count;
};

export const getSessions = async (
	db: Collection,
	query: PlainObject
): Promise<number> => {
	return db.countDocuments({...query, lastUpdated: {$exists: true}});
};

export const getImpressions = async (
	db: Collection,
	query: PlainObject
): Promise<number> => {
	return db.countDocuments({...query, lastUpdated: {$exists: false}});
};

export const getTotalTimeSpent = async (
	db: Collection,
	query: PlainObject
): Promise<number> => {
	const [result] = await db
		.aggregate([
			{$match: {...query, lastUpdated: {$exists: true}}},
			{$project: {time: {$subtract: ['$lastUpdated', '$date']}}},
			{$group: {_id: null, count: {$sum: '$time'}}}
		])
		.toArray();
	return result ? result.count : null;
};

export const getBreakdown = async (
	db: Collection,
	field: string
): Promise<Breakdown> => {
	const aggregated = await db
		.aggregate([
			{$match: {[field]: {$exists: true}}},
			{$unwind: `$${field}`},
			{$group: {_id: `$${field}`, users: {$addToSet: '$identifier'}}},
			{$project: {[field]: 1, count: {$size: '$users'}}}
		])
		.toArray();
	return aggregated.map(
		({
			_id,
			...a
		}: {
			_id: string;
			count: number;
		}): {id: string; count: number} => ({
			...a,
			id: _id
		})
	);
};

export const getActivityLevels = async (
	db: Collection,
	content: string
): Promise<any> => {
	const aggregated = await db
		.aggregate([
			{$match: {content}},
			{$unwind: '$level'},
			{$group: {_id: '$level', users: {$addToSet: '$identifier'}}},
			{$project: {level: 1, count: {$size: '$users'}}}
		])
		.toArray();
	return aggregated.map(
		({_id, ...a}: any): any => ({
			...a,
			id: _id
		})
	);
};

export const getActivityLevelsById = async (
	db: Collection,
	content_id: string
): Promise<any> => {
	const aggregated = await db
		.aggregate([
			{$match: {content_id}},
			{$unwind: '$level'},
			{$group: {_id: '$level', users: {$addToSet: '$identifier'}}},
			{$project: {level: 1, count: {$size: '$users'}}}
		])
		.toArray();
	return aggregated.map(
		({_id, ...a}: any): any => ({
			...a,
			id: _id
		})
	);
};

export const getContent = async (db: Collection): Promise<string[]> => {
	return db.distinct('content', {});
};

export const getContentEngagementLevel = async (
	db: Collection,
	content: string
): Promise<string[]> => {
	return db.distinct('level', {
		content
	});
};
