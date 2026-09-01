export interface EventData {
	event: string;
	times?: string;
	athlete?: string;
}

export interface Athlete {
	name: string;
	url: string;
	id: string;
}

export interface PersonalRecord {
	event: string;
	time: string;
	delta?: string;
	athlete: Omit<Athlete, "url">;
	yearsSinceBroken?: string;
}

export interface Performance {
	event: string;
	time: number;
	id: number;
	name: string;
}

export interface LeaderboardEntry {
	nationalRank?: number;
	formerNationalRank?: number;
	NERank?: number;
	formerNERank?: number;
	nescacRank?: number;
	formerNescacRank?: number;
	athlete?: string;
	time?: string;
	team?: string;
	date?: string;
}

export interface Leaderboard {
	[event: string]: LeaderboardEntry[];
}
