const client = require('./client');

let defaultPlatform = null;
// TODO: Implement way to determine language
let defaultLanguage = 'en';
let defaultIdentifier = null;
let defaultVersion = null;

try {
	const {Platform} = require('react-native');
	defaultPlatform = Platform.OS;
} catch (err) {
	console.warn('react-native not found. Could not determine platform.');
}

module.exports = client({
	defaultPlatform,
	defaultIdentifier,
	defaultLanguage,
	defaultVersion
});
