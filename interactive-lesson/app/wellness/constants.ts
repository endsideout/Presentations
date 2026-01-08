import { Unit, Quest, Badge } from './types';

export const WELLNESS_UNITS: Unit[] = [
    { id: 'w1', name: 'Social Wellbeing', icon: '🤝', color: '#f43f5e', description: 'Building friendships and being a great team player!' },
    { id: 'w2', name: 'Emotional Wellbeing', icon: '😊', color: '#ec4899', description: 'Understanding your big feelings and finding your calm.' },
    { id: 'w3', name: 'Environmental Wellbeing', icon: '🌍', color: '#10b981', description: 'Taking care of our beautiful planet and local spaces.' },
    { id: 'w4a', name: 'Financial Literacy Pt. 1', icon: '💰', color: '#f59e0b', description: 'Learning about money: Earning and Saving.' },
    { id: 'w4b', name: 'Financial Literacy Pt. 2', icon: '🐷', color: '#d97706', description: 'Smart Spending: Needs vs. Wants!' },
    { id: 'w4c', name: 'Financial Literacy Pt. 3', icon: '📈', color: '#b45309', description: 'Planning for the future: Sharing and Growing.' },
    { id: 'w5', name: 'Intellectual Wellbeing', icon: '💡', color: '#8b5cf6', description: 'Keep your curiosity alive and learn something new!' },
    { id: 'w6', name: 'Occupational Wellbeing', icon: '🛠️', color: '#6366f1', description: 'Exploring dream jobs and building cool skills.' },
    { id: 'w7', name: 'Physical Wellbeing', icon: '⛹️', color: '#3b82f6', description: 'Giving your body the energy and rest it needs.' },
    { id: 'w8', name: 'Spiritual Wellbeing', icon: '✨', color: '#06b6d4', description: 'Finding your purpose and connecting with your values.' }
];

export const WELLNESS_QUESTS: Quest[] = [
    { id: 101, title: 'Kindness Connector', description: 'Give a genuine compliment to 3 different friends today.', dimension: 'w1', points: 15, icon: '💬' },
    { id: 102, title: 'Calm Cloud', description: 'Practice 2 minutes of "Belly Breathing" when feeling excited.', dimension: 'w2', points: 10, icon: '☁️' },
    { id: 103, title: 'Recycle Ranger', description: 'Sort the recycling at home correctly today.', dimension: 'w3', points: 15, icon: '♻️' },
    { id: 104, title: 'The Penny Saver', description: 'Put some money in your savings jar and write down your goal.', dimension: 'w4a', points: 20, icon: '🏺' },
    { id: 105, title: 'Future Dreamer', description: 'Draw a picture of yourself in your future dream job.', dimension: 'w6', points: 15, icon: '🎨' }
];

export const ALL_BADGES: Badge[] = [
    // Health badges removed as per instructions, only wellness related if any (adding placeholder or reusing existing structure)
    { dimension: 'w1', level: 'bronze', icon: '🤝', name: 'Friendship Ace', requirement: 'Complete 20% of Wellness 1' },
    { dimension: 'w4a', level: 'bronze', icon: '💎', name: 'Coin Master', requirement: 'Complete 20% of Financial Literacy' }
];

export const INITIAL_LEADERBOARD: any[] = [
    { name: 'Class 4-A', points: 92 },
    { name: 'Class 3-B', points: 88 },
    { name: 'Your Class (4-C)', points: 85, isUser: true },
    { name: 'Class 5-D', points: 80 }
];
