const {Router} = require('express');
const bodyParser = require('body-parser');
const ow = require('ow');
const {pickBy} = require('lodash');
const {asyncHandler} = require('../handler');

module.exports = ({db}) => {
	const router = new Router();
	router.use(bodyParser.json());
	router.post(
		'/impression',
		asyncHandler(async request => {
			const {
				identifier,
				content,
				content_id,
				level,
				platform,
				language,
				direction,
				version
			} = request.body;
			ow(identifier, ow.string);
			ow(content, ow.string);
			ow(level, ow.string);
			ow(platform, ow.any(ow.string, ow.nullOrUndefined));
			ow(content_id, ow.any(ow.string, ow.nullOrUndefined));
			ow(language, ow.any(ow.string, ow.nullOrUndefined));
			ow(direction, ow.any(ow.string, ow.nullOrUndefined));
			ow(version, ow.any(ow.string, ow.nullOrUndefined));
			const impression = pickBy({
				identifier,
				content,
				content_id,
				level,
				platform,
				language,
				version,
				direction,
				date: Date.now()
			});
			const result = await db.insert(impression);
			return {
				impression: result
			};
		})
	);
	return router;
};
