interface UserAchievement {
    name: string;
    description?: string;
    unlockedTimestamp: number | null;
    progress: null | boolean | {
        target: number;
        current: number;
    }
}

export default UserAchievement;
