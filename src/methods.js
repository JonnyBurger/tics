exports.getUsers = async (db, query) => {
	const [result] = await db
		.aggregate(
			[
				query ? {$match: query} : null,
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

exports.getSessions = async (db, query) => {
	return db.count(query);
};

exports.getTotalTimeSpent = async (db, query) => {
	const [result] = await db
		.aggregate([
			{$match: {...query, lastUpdated: {$exists: true}}},
			{$project: {time: {$subtract: ['$lastUpdated', '$date']}}},
			{$group: {_id: null, count: {$sum: '$time'}}}
		])
		.toArray();
	return result ? result.count : null;
};

exports.getBreakdown = async (db, field) => {
	const aggregated = await db
		.aggregate([
			{$match: {[field]: {$exists: true}}},
			{$unwind: `$${field}`},
			{$group: {_id: `$${field}`, users: {$addToSet: '$identifier'}}},
			{$project: {[field]: 1, count: {$size: '$users'}}}
		])
		.toArray();
	return aggregated.map(({_id, ...a}) => ({
		...a,
		id: _id
	}));
};

exports.getActivityLevels = async (db, content) => {
	const aggregated = await db
		.aggregate([
			{$match: {content}},
			{$unwind: '$level'},
			{$group: {_id: '$level', users: {$addToSet: '$identifier'}}},
			{$project: {level: 1, count: {$size: '$users'}}}
		])
		.toArray();
	return aggregated.map(({_id, ...a}) => ({
		...a,
		id: _id
	}));
};

exports.getActivityLevelsById = async (db, content_id) => {
	const aggregated = await db
		.aggregate([
			{$match: {content_id}},
			{$unwind: '$level'},
			{$group: {_id: '$level', users: {$addToSet: '$identifier'}}},
			{$project: {level: 1, count: {$size: '$users'}}}
		])
		.toArray();
	return aggregated.map(({_id, ...a}) => ({
		...a,
		id: _id
	}));
};

exports.getContent = async db => {
	return db.distinct('content');
};

exports.getContentEngagementLevel = async (db, content) => {
	return db.distinct('level', {
		content
	});
};
