const pickBy = require('lodash/pickBy');
const withSession = require('./withSession');

module.exports = ({
	defaultIdentifier = null,
	defaultPlatform = null,
	defaultLanguage = null,
	defaultVersion = null
}) => ({endpoint}) => {
	const impression = async ({
		identifier = defaultIdentifier,
		platform = defaultPlatform,
		content,
		content_id,
		level = 'VIEW',
		language = defaultLanguage,
		version = defaultVersion
	}) => {
		const response = await fetch(`${endpoint}/telemetry/impression`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(
				pickBy({
					identifier,
					platform,
					content,
					content_id,
					level,
					language,
					version
				})
			)
		});
		if (response.status !== 200) {
			console.log(response);
			throw new Error('Request failed ' + response.statusCode);
		}
		return response.json();
	};

	const session = async data => {
		const response = await impression(data);
		const interval = setInterval(async () => {
			await update({
				identifier: data.identifier,
				id: response.data.impression._id
			});
			console.log('Updated impression');
		}, 10000);
		return {
			response,
			clear: () => {
				console.log('Stopped session');
				clearInterval(interval);
			}
		};
	};

	const update = async ({identifier = defaultIdentifier, id}) => {
		const response = await fetch(`${endpoint}/telemetry/impression/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				identifier
			})
		});
		if (response.status !== 200) {
			console.log(response);
			throw new Error('Request failed ' + response.statusCode);
		}
		return response.json();
	};

	return {
		impression,
		session,
		withSession: withSession(session)
	};
};
