import { NextRequest, NextResponse } from "next/server";

import type { SteamAchievement } from "@/models/SteamAchievementsResponse";
import type UserAchievement from "@/models/UserAchievement";
import type SteamAchievementsResponse from "@/models/SteamAchievementsResponse";
import XboxAchievementsResponse from "@/models/XboxAchievementsResponse";
import XboxAchievement, { getAchievementProgress } from "@/models/XboxAchievement";

const HALO_TITLE_ID = "1144039928";

type GetAchievementsResponse = {
    achievements: UserAchievement[];
}

const toUserAchievement = (achievement: SteamAchievement): UserAchievement => ({
    name: achievement.name ?? achievement.apiname,
    description: achievement.description ?? "",
    unlockedTimestamp: achievement.unlocktime !== 0 ? achievement.unlocktime : null,
    progress: null
});

const fromXboxAchievement = (achievement: XboxAchievement): UserAchievement => {
    const unlockedDate = achievement.progressState == "Achieved"
        ? new Date(achievement.progression.timeUnlocked).getTime()
        : null;

    const achievementProgress = getAchievementProgress(achievement);

    const progressValue = typeof achievementProgress === "boolean"
        ? achievementProgress
        : { target: achievementProgress[1], current: achievementProgress[0] }

    return ({
        name: achievement.name,
        unlockedTimestamp: unlockedDate,
        progress: progressValue
    });
};

const fetchSteamAchievements = async (steamId: string, gameId: string) => {
    console.log("Fetching achievements for ", steamId);

    const url = `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${gameId}&key=${process.env.STEAM_API_KEY}&steamid=${steamId}&l=en-US`;

    const response = await fetch(url, {
        cache: "force-cache",
        next: { revalidate: 2 }
    });

    if (!response.ok) {
        console.warn("Unable to fetch user achievements: ", response);

        return NextResponse.json({ achievements: [] });
    }

    const steamAchievements: SteamAchievementsResponse = await response.json();

    if (!steamAchievements.playerstats.success) {
        console.warn("Unable to fetch user achievements: ", steamAchievements);

        return NextResponse.json({ achievements: [] });
    }

    const unlockedAchievements = steamAchievements
        .playerstats
        .achievements
        .map(toUserAchievement)

    return NextResponse.json({ achievements: unlockedAchievements });
}

const fetchXboxAchievements = async (xuid: string, appKey: string) => {
    const url = `https://xbl.io/api/v2/achievements/player/${xuid}/${HALO_TITLE_ID}`;

    const response = await fetch(url, {
        cache: "force-cache",
        next: { revalidate: 2 },
        headers: {
            "X-Authorization": appKey,
            "X-Contract": "100",
            "Accept-Language": "en-US",
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        const error = await response.text();

        console.warn("Unable to fetch user achievements fox Xbox: ", response.status, response.statusText, error);

        return NextResponse.json({ achievements: [] });
    }

    const xboxAchievements: XboxAchievementsResponse = await response.json();

    const unlockedAchievements = xboxAchievements
        .achievements
        .map(fromXboxAchievement)

    return NextResponse.json({ achievements: unlockedAchievements });
}

export const GET = async (request: NextRequest): Promise<NextResponse<GetAchievementsResponse>> => {
    const steamIdCookie = request.cookies.get("STEAM_USER_ID");
    const xuidCookie = request.cookies.get("XUID");
    const appKeyCookie = request.cookies.get("APP_KEY");

    if (xuidCookie && appKeyCookie) {
        // Xbox authentication is always for Halo MCC
        return fetchXboxAchievements(xuidCookie.value, appKeyCookie.value);
    }


    if (steamIdCookie) {
        const gameId = request.nextUrl.searchParams.get("gameId") || "976730"; // default to Halo: MCC

        return fetchSteamAchievements(steamIdCookie.value, gameId);
    }

    console.debug("User not authenticated, returning default list of achievements");

    return NextResponse.json({ achievements: [] });
}
