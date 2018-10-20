import {pickBy} from 'lodash';

let defaultPlatform = null;
// TODO: Implement way to determine language
let defaultLanguage = 'en';
let defaultIdentifier = null;
let defaultVersion = null;

try {
	const Expo = require('expo');
	const {installationId, manifest} = Expo.Constants;
	defaultVersion = manifest.version;
	defaultIdentifier = installationId;
} catch (err) {
	console.warn(
		'Expo could not be found. Could not determine version number and identifier.'
	);
}

try {
	const {Platform} = require('react-native');
	defaultPlatform = Platform.OS;
} catch (err) {
	console.warn('react-native not found. Could not determine platform.');
}

export default ({endpoint}) => {
	return {
		impression: ({
			identifier = defaultIdentifier,
			platform = defaultPlatform,
			content,
			content_id,
			level = 'VIEW',
			language = defaultLanguage,
			version = defaultVersion
		}) => {
			return fetch(`${endpoint}/impression`, {
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
		}
	};
};
