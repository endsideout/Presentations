import { test, expect } from '@playwright/test';

test.describe('Wellness Component Smoke Tests', () => {

    test('Wellness Page Initial Render', async ({ page }) => {
        // Navigate to the wellness page
        await page.goto('/wellness');

        // Check for the main header
        await expect(page.getByRole('heading', { name: /3D Wellness Dimension/i })).toBeVisible();

        // Check that initial Total XP is 0
        const totalXp = page.locator('text=Total XP').locator('..').locator('.text-2xl');
        await expect(totalXp).toHaveText('0');

        // Check that the AI buddy message is present
        await expect(page.getByText(/Ready to explore your wellness/i)).toBeVisible();
    });

    test('Complete a Quest and Verify Updates', async ({ page }) => {
        await page.goto('/wellness');

        // Find the "Drink Water" quest (or similar if that specific one doesn't exist, we'll pick the first one)
        // Based on typical quest structures, let's target the first "Start Quest" button
        const startButton = page.getByRole('button', { name: 'Start Quest' }).first();
        const questCard = startButton.locator('../..');

        // Get the quest title for verification (optional, but good for debugging)
        const questTitle = await questCard.locator('h3').textContent();
        console.log(`Testing quest: ${questTitle}`);

        // Click Start Quest
        await startButton.click();

        // Verify button changes to Done
        await expect(page.getByRole('button', { name: '✓ Done' }).first()).toBeVisible();

        // Verify Total XP increased (assuming +20 for standard quests, but checking > 0 is safer for smoke)
        const totalXp = page.locator('text=Total XP').locator('..').locator('.text-2xl');
        await expect(totalXp).not.toHaveText('0');

        // Verify progress bar updated (checking "Progress" stat card)
        const progressCard = page.locator('text=Progress').locator('..');
        await expect(progressCard).not.toHaveText('0%');
    });

    test('Leaderboard Render', async ({ page }) => {
        await page.goto('/wellness');
        await expect(page.getByRole('heading', { name: /Class Pizza Race!/i })).toBeVisible();
        // Check for user in leaderboard
        await expect(page.getByText('Super Student')).toBeVisible();
    });

});
