import { test, expect } from '@playwright/test';

test.describe('Interactive Lesson Flow', () => {

    test('Complete Lesson Walkthrough', async ({ page }) => {
        // Disable animations for stability
        await page.addInitScript(() => {
            const style = document.createElement('style');
            style.innerHTML = `
                *, *::before, *::after {
                    animation: none !important;
                    transition: none !important;
                }
            `;
            document.head.appendChild(style);
        });

        // 1. Introduction
        await page.goto('/');
        await expect(page.getByRole('heading', { name: /HEALTHY EATING/i })).toBeVisible();
        await page.getByRole('button', { name: 'Start Learning' }).click();

        // 2. Information: What's On Your Plate?
        await expect(page).toHaveURL(/\/slide\/2/);
        await expect(page.getByRole('heading', { name: /WHAT’S ON YOUR PLATE\?/i })).toBeVisible();
        await page.getByRole('button', { name: 'Build My Plate' }).click();

        // 3. Activity: Build Your Plate
        await expect(page).toHaveURL(/\/slide\/3/);
        // Drag and Drop Logic
        // Defining source and target selectors based on image alts or container roles
        const healthyItems = [
            { name: 'Fruits', id: 'fruits', category: 'Fruits' },
            { name: 'Vegetables', id: 'veggies', category: 'Vegetables' },
            { name: 'Whole Grains', id: 'grains', category: 'Whole Grains' },
            { name: 'Healthy Protein', id: 'protein', category: 'Healthy Meat' }
        ];

        // The plate drop zone is the central container. 
        // In our code, it's defined within the div with onDrop. 
        // We can assume it's the "relative grid h-64 w-64..." container or locate by role/class. 
        // Since accessiblity roles might be tricky with divs, we might need a more specific selector.
        // Let's assume we can drag to ".grid-cols-2.grid-rows-2" which is the plate.
        const plateSelector = '.grid-cols-2.grid-rows-2';

        // Helper for drag and drop
        for (const item of healthyItems) {
            const source = page.locator(`img[alt="${item.name}"]`).first();
            // Note: The drag source in the code is the parent div, but dragging the image usually works if pointer-events aren't none on img.
            // Wait, the img has pointer-events-none in Slide 3 code: className="... pointer-events-none"
            // So we must drag the parent div.
            const sourceDiv = page.locator(`div[draggable][title="${item.name}"]`);

            await sourceDiv.dragTo(page.locator(plateSelector), { force: true });
            // Verify feedback?
            await expect(page.getByText('Great choice! 👍')).toBeVisible();
        }

        // Check next button appears and click
        await page.getByRole('button', { name: 'Next Activity ➡️' }).click();

        // 4. Info: Fruits & Vegetables
        await expect(page).toHaveURL(/\/slide\/4/);
        await expect(page.getByRole('heading', { name: /FRUITS AND VEGETABLES/i })).toBeVisible();
        await page.getByRole('button', { name: 'Next ▶' }).click();

        // 5. Info: Fiber
        await expect(page).toHaveURL(/\/slide\/5/);
        await expect(page.getByRole('heading', { name: /FIBER/i })).toBeVisible();
        await page.getByRole('button', { name: 'Next ▶' }).click();

        // 6. Quiz: Sometimes or Anytime (Banana vs Fries vs Juice)
        await expect(page).toHaveURL(/\/slide\/6/);
        // Click Banana (Anytime)
        await page.locator('button:has-text("Banana")').click();
        await page.getByRole('button', { name: 'Anytime ✅' }).click();
        await expect(page.getByText(/Correct!/i)).toBeVisible();
        await page.getByRole('button', { name: 'Next ▶' }).click();

        // 7. Info: Grains
        await expect(page).toHaveURL(/\/slide\/7/);
        await expect(page.getByRole('heading', { name: /GRAINS/i })).toBeVisible();
        await page.getByRole('button', { name: 'Next ▶' }).click();

        // 8. Activity: Grains Sorting
        // Drag Sugary Cereal -> Sometimes
        // Drag Whole Grain Bread -> Anytime
        // ...
        // Let's just solve it quickly.
        await expect(page).toHaveURL(/\/slide\/8/);
        const sometimesZone = page.locator('h3:has-text("SOMETIMES")').locator('..'); // Parent div
        const anytimeZone = page.locator('h3:has-text("ANYTIME")').locator('..'); // Parent div

        const sortItems = [
            { name: 'Sugary Cereal', zone: sometimesZone },
            { name: 'Granola Bar', zone: sometimesZone },
            { name: 'White Bread', zone: sometimesZone },
            { name: 'Whole Grain Bread', zone: anytimeZone },
            { name: 'Brown Rice', zone: anytimeZone },
            { name: 'Whole Grain Pasta', zone: anytimeZone },
        ];

        for (const item of sortItems) {
            const dragger = page.locator(`div[draggable] p:has-text("${item.name}")`).locator('..');
            await dragger.dragTo(item.zone, { force: true });
        }

        await expect(page.getByText(/All done! Excellent work!/i)).toBeVisible();
        await page.getByRole('button', { name: 'Next ▶' }).click();

        // 9. Info: Protein
        await expect(page).toHaveURL(/\/slide\/9/);
        await page.getByRole('button', { name: 'Next ▶' }).click();

        // 10. Info: Meat
        await expect(page).toHaveURL(/\/slide\/10/);
        await page.getByRole('button', { name: 'Next ▶' }).click();

        // 11. Info: Plant Protein
        await expect(page).toHaveURL(/\/slide\/11/);
        await page.getByRole('button', { name: 'Next ▶' }).click();

        // 12. Activity: Protein Sorting
        await expect(page).toHaveURL(/\/slide\/12/);
        const anytimeZone12 = page.locator('h3:has-text("ANYTIME")').locator('..');
        const sometimesZone12 = page.locator('h3:has-text("SOMETIMES")').locator('..');

        // Sort items
        // Bacon -> Sometimes
        await page.locator(`div[draggable] p:has-text("Bacon")`).locator('..').dragTo(sometimesZone12, { force: true });
        // Salami -> Sometimes
        await page.locator(`div[draggable] p:has-text("Salami")`).locator('..').dragTo(sometimesZone12, { force: true });
        // Chicken -> Anytime
        await page.locator(`div[draggable] p:has-text("Roasted Chicken")`).locator('..').dragTo(anytimeZone12, { force: true });
        // Salmon -> Anytime
        await page.locator(`div[draggable] p:has-text("Salmon")`).locator('..').dragTo(anytimeZone12, { force: true });

        await expect(page.getByText(/All done! Excellent work!/i)).toBeVisible();
        await page.getByRole('button', { name: 'Next ▶' }).click();

        // 13. Quiz: Which Plate
        await expect(page).toHaveURL(/\/slide\/13/);
        // Click Balanced Plate (image59)
        await page.locator('img[alt="Healthy balanced plate"]').click();
        await expect(page.getByText(/Great choice!/i)).toBeVisible();
        await page.getByRole('button', { name: 'Next ▶' }).click();

        // End Slide
        await expect(page).toHaveURL(/\/slide\/end/);
        await expect(page.getByRole('heading', { name: /GREAT JOB!/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Restart Lesson/i })).toBeVisible();
    });
});
