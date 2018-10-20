exports.getUsers = async (db, query) => {
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

exports.getBreakdown = async (db, field) => {
	const aggregated = await db.aggregate([
		{$match: {[field]: {$exists: true}}},
		{$unwind: `$${field}`},
		{$group: {_id: `$${field}`, users: {$addToSet: '$identifier'}}},
		{$project: {[field]: 1, count: {$size: '$users'}}}
	]);
	return aggregated.map(({_id, ...a}) => ({
		...a,
		id: _id
	}));
};

exports.getActivityLevels = async (db, content) => {
	const aggregated = await db.aggregate([
		{$match: {content}},
		{$unwind: '$level'},
		{$group: {_id: '$level', users: {$addToSet: '$identifier'}}},
		{$project: {level: 1, count: {$size: '$users'}}}
	]);
	return aggregated.map(({_id, ...a}) => ({
		...a,
		id: _id
	}));
};

exports.getActivityLevelsById = async (db, content_id) => {
	const aggregated = await db.aggregate([
		{$match: {content_id}},
		{$unwind: '$level'},
		{$group: {_id: '$level', users: {$addToSet: '$identifier'}}},
		{$project: {level: 1, count: {$size: '$users'}}}
	]);
	return aggregated.map(({_id, ...a}) => ({
		...a,
		id: _id
	}));
};
