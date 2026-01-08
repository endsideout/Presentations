export const getHealthEncouragement = async (name: string, questTitle: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const messages = [
        `Way to go, ${name}! You crushed "${questTitle}"! 🌟`,
        `Amazing work on "${questTitle}", ${name}! Keep it up! 🚀`,
        `You're unstoppable, ${name}! "${questTitle}" is complete! 💪`,
        `Great job finishing "${questTitle}"! You're a wellness star, ${name}! ✨`,
        `BAM! "${questTitle}" done! High five, ${name}! ✋`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
};
