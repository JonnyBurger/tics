import {pickBy} from 'lodash';
import withSession from './withSession';

export default ({
	defaultIdentifier = null,
	defaultPlatform = null,
	defaultLanguage = null,
	defaultVersion = null
}: {
	defaultIdentifier: Identifier;
	defaultPlatform: Platform;
	defaultLanguage: Language;
	defaultVersion: Version;
}) => ({endpoint}: {endpoint: string}) => {
	const impression = async ({
		identifier = defaultIdentifier,
		platform = defaultPlatform,
		content,
		content_id,
		level = 'VIEW',
		language = defaultLanguage,
		version = defaultVersion
	}: Impression): Promise<{
		impression: {
			_id: string;
			identifier: Identifier;
			content: string;
			content_id: string;
			level: string;
			platform: Platform;
			language: Language;
			version: Version;
			direction: string;
			date: number;
		};
	}> => {
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
			throw new Error('Request failed ' + response.status);
		}
		const {data} = await response.json();
		return data;
	};

	const session: Session = async (data: Impression) => {
		const response = await impression(data);
		const interval = setInterval(async () => {
			await update({
				identifier: data.identifier,
				id: response.impression._id
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

	const update = async ({
		identifier = defaultIdentifier,
		id
	}: {
		identifier: string | null;
		id: string;
	}) => {
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
			throw new Error('Request failed ' + response.status);
		}
		return response.json();
	};

	return {
		impression,
		session,
		withSession: withSession(session)
	};
};
