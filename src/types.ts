export type TimeRange = 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly';

export type Platform = 'ios' | 'android' | 'web' | string | null;
export type Language = 'de' | 'en' | 'it' | string | null;
export type Identifier = string;
export type Version = string | null;

export interface Impression {
	identifier: Identifier;
	platform: Platform;
	content: string;
	content_id?: string | null;
	level: 'VIEW' | string;
	language: Language;
	version: string | null;
	direction?: string;
	lastUpdated?: number;
}

export interface SessionResponse {
	response: any;
	clear: () => void;
}

export type Session = (data: Impression) => Promise<SessionResponse>;

export interface PlainObject {
	[name: string]: any;
}
export type Breakdown = {
	count: number;
	id: string;
}[];