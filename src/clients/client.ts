import {pickBy} from 'lodash';
import {
	Identifier,
	Platform,
	Language,
	Version,
	Impression,
	Session,
	PlainObject
} from '../types';
import withSession from './withSession';

interface ImpressionReturnType {
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
}

export default ({
	defaultIdentifier = '',
	defaultPlatform = null,
	defaultLanguage = null,
	defaultVersion = null
}: {
	defaultIdentifier: Identifier;
	defaultPlatform: Platform;
	defaultLanguage: Language;
	defaultVersion: Version;
}): any => ({endpoint}: {endpoint: string}): any => {
	const impression = async ({
		identifier = defaultIdentifier,
		platform = defaultPlatform,
		content,
		content_id,
		level = 'VIEW',
		language = defaultLanguage,
		version = defaultVersion
	}: Impression): Promise<any> => {
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

	const update = async ({
		identifier = defaultIdentifier,
		id
	}: {
		identifier: string | null;
		id: string;
	}): Promise<PlainObject> => {
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

	const session: Session = async (
		data: Impression
	): Promise<{
		response: any;
		clear: () => void;
	}> => {
		const response = await impression(data);
		const interval = setInterval(async (): Promise<void> => {
			await update({
				identifier: data.identifier,
				id: response.impression._id
			});
			console.log('Updated impression');
		}, 10000);
		return {
			response,
			clear: (): void => {
				console.log('Stopped session');
				clearInterval(interval);
			}
		};
	};

	return {
		impression,
		session,
		withSession: withSession(session)
	};
};
