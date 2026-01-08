export interface Unit {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
}

export interface Quest {
    id: number;
    title: string;
    description: string;
    dimension: string;
    points: number;
    icon: string;
}

export interface Badge {
    dimension: string;
    level: string;
    icon: string;
    name: string;
    requirement: string;
}

export interface UserDimensionState {
    progress: number;
    points: number;
}

export interface UserData {
    name: string;
    totalPoints: number;
    dimensions: Record<string, UserDimensionState>;
    completedQuests: number[];
    earnedBadgeIndices: number[];
    streakDays: number;
}
