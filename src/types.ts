type TimeRange = 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly';

type Platform = 'ios' | 'android' | 'web' | string | null;
type Language = 'de' | 'en' | 'it' | string | null;
type Identifier = string | null;
type Version = string | null;

type Impression = {
	identifier: Identifier;
	platform: Platform;
	content: string;
	content_id: string | null;
	level: 'VIEW' | string;
	language: Language;
	version: string | null;
	direction: string;
	lastUpdated?: number;
};

type SessionResponse = {
	response: any;
	clear: () => void;
};

type Session = (data: Impression) => Promise<SessionResponse>;

type PlainObject = {[name: string]: any};
type Breakdown = {
	count: number;
	id: string;
}[];
