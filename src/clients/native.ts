import client from './client';
import {Platform, Language, Identifier, Version} from '../types';

let defaultPlatform: Platform = null;
// TODO: Implement way to determine language
let defaultLanguage: Language = 'en';
let defaultIdentifier: Identifier = '';
let defaultVersion: Version = null;

try {
	const {Platform} = require('react-native');
	defaultPlatform = Platform.OS as string;
} catch (err) {
	console.warn('react-native not found. Could not determine platform.');
}

export default client({
	defaultPlatform,
	defaultIdentifier,
	defaultLanguage,
	defaultVersion
});
