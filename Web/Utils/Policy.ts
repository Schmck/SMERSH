import { hexToDec, decToHex } from 'hex2dec'
import { SearchClient } from '../../Elastic';
import { PolicySearchReport } from '../../Reports/Entities/policy';

export class Policy {

    public static async getPolicies(steamId: string) {
        const id = decToHex(steamId);
        const policies = await SearchClient.Search<PolicySearchReport>(PolicySearchReport, {
            "query": {
                "match": {
                    "PlayerId": id
                }
            }
        })

        return policies;
    }

    public static getDurationString(startDate: Date, endDate: Date): string {
        const durationMs = endDate.getTime() - startDate.getTime();

        const seconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years > 0) {
            return `${years} year${years > 1 ? 's' : ''}`;
        }
        if (months > 0) {
            return `${months} month${months > 1 ? 's' : ''}`;
        }
        if (weeks > 0) {
            return `${weeks} week${weeks > 1 ? 's' : ''}`;
        }
        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''}`;
        }
        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        return `${seconds} second${seconds > 1 ? 's' : ''}`;
    }
}