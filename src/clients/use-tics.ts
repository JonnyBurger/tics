import pickBy from 'lodash/pickBy';
import {useEffect} from 'react';
import {Impression, PlainObject, V3Session} from '../types';

export const useTics = (
	isFocused: boolean,
	endpoint: string,
	{
		identifier,
		platform,
		content,
		content_id,
		level,
		language,
		version,
	}: Impression
): void => {
	useEffect(() => {
		if (!isFocused) {
			return;
		}
		let clearServer: (() => void) | null = null;
		let clearClient: (() => void) | null = null;

		const impression = async (): Promise<any> => {
			const response = await fetch(`${endpoint}/telemetry/impression`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(
					pickBy({
						identifier,
						platform,
						content,
						content_id,
						level,
						language,
						version,
					})
				),
			});
			if (response.status !== 200) {
				console.log(response);
				throw new Error('Request failed ' + response.status);
			}
			const {data} = await response.json();
			return data;
		};

		const update = async (props: {
			sessionIdentifier: string | null;
		}): Promise<PlainObject> => {
			const response = await fetch(
				`${endpoint}/telemetry/impression/${props.sessionIdentifier}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						identifier,
					}),
				}
			);
			if (response.status !== 200) {
				console.log(response);
				throw new Error('Request failed ' + response.status);
			}
			return response.json();
		};

		const session: V3Session = async (): Promise<{
			response: any;
			clear: () => void;
		}> => {
			const response = await impression();
			const interval = setInterval(async (): Promise<void> => {
				await update({
					sessionIdentifier: response.impression._id,
				});
				console.log('Updated impression');
			}, 10000);
			return {
				response,
				clear: (): void => {
					console.log('Stopped session');
					clearInterval(interval);
				},
			};
		};

		session()
			.then((res) => {
				console.log('Session started');
				clearServer = res.clear;
				clearClient = (): void => res.clear();
			})
			.catch((err) => {
				console.log('Could not start session', err);
			});
		return (): void => {
			if (clearServer) {
				clearServer();
			}
			if (clearClient) {
				clearClient();
			}
		};
	}, [
		isFocused,
		content,
		content_id,
		identifier,
		endpoint,
		language,
		level,
		platform,
		version,
	]);
};
