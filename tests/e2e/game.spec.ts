import { test, expect } from '@playwright/test';

test.describe('Cyber-Immunology TD Game Journey', () => {
  test('Complete Primary User Journey', async ({ page }) => {
    // 1. Boot and Main Menu
    await page.goto('/');
    const title = page.locator('h1');
    await expect(title).toContainText('CYBER-IMMUNOLOGY');

    const startBtn = page.locator('[data-testid="btn-menu-start"]');
    await expect(startBtn).toBeVisible();

    // 2. Start Defense
    await startBtn.click();
    await expect(page.locator('#modal-container')).toBeHidden();

    // 3. Verify HUD Elements
    const hudWave = page.locator('[data-testid="hud-wave"]');
    const hudAtp = page.locator('[data-testid="hud-atp"]');
    const hudScore = page.locator('[data-testid="hud-score"]');

    await expect(hudWave).toContainText('WAVE 01');
    await expect(hudAtp).toBeVisible();
    await expect(hudScore).toContainText('0');

    // 4. Select and Place IgG Tower
    const iggCard = page.locator('[data-testid="tower-card-igg"]');
    await expect(iggCard).toBeVisible();
    await iggCard.click();

    // Click on canvas at buildable coordinate (col 0, row 0 -> 24px, 24px)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await canvas.click({ position: { x: 24, y: 24 } });

    // Check that ATP was deducted (Acute starting 350 - 100 = 250)
    await expect(hudAtp).toHaveText('250');

    // 5. Inspect Placed Tower (click placed tower at 24px, 24px)
    await canvas.click({ position: { x: 24, y: 24 } });

    const inspector = page.locator('#tower-inspector');
    await expect(inspector).toBeVisible();
    await expect(inspector).toContainText('IgG Pulse Sentinel');

    // Upgrade Tier 1 (Cost 75 -> ATP goes to 175)
    const upgradeT1 = page.locator('[data-testid="btn-upgrade-t1"]');
    await expect(upgradeT1).toBeVisible();
    await upgradeT1.click();
    await expect(hudAtp).toHaveText('175');

    // Select Branch A (Cost 150 -> ATP goes to 25)
    const branchA = page.locator('[data-testid="btn-branch-a"]');
    await expect(branchA).toBeVisible();
    await branchA.click();
    await expect(hudAtp).toHaveText('25');

    // 6. Sell Tower (Invested 100 + 75 + 150 = 325, 70% refund = 227 -> ATP = 25 + 227 = 252)
    const sellBtn = page.locator('[data-testid="btn-sell-tower"]');
    await expect(sellBtn).toBeVisible();
    await sellBtn.click();
    await expect(inspector).toBeHidden();
    await expect(hudAtp).toHaveText('252');

    // 7. Test Send Early Button
    const sendEarlyBtn = page.locator('[data-testid="btn-send-early"]');
    await expect(sendEarlyBtn).toBeVisible();
    await sendEarlyBtn.click();

    // 8. Test Pause / Resume
    const pauseBtn = page.locator('[data-testid="btn-pause"]');
    await pauseBtn.click();

    const pauseModal = page.locator('#modal-container');
    await expect(pauseModal).toBeVisible();
    await expect(pauseModal).toContainText('PAUSED');

    const resumeBtn = page.locator('[data-testid="btn-pause-resume"]');
    await resumeBtn.click();
    await expect(pauseModal).toBeHidden();
  });

  test('Level Select and High Scores Modals', async ({ page }) => {
    await page.goto('/');

    // Open Level Select
    await page.locator('[data-testid="btn-menu-level-select"]').click();
    await expect(page.locator('h2')).toContainText('MAP & DIFFICULTY');

    // Switch map to Lymph Spiral
    const lymphMap = page.locator('[data-testid="map-select-lymph_spiral"]');
    await expect(lymphMap).toBeVisible();
    await lymphMap.click();

    // Switch difficulty to Resident
    const resDiff = page.locator('[data-testid="diff-select-resident"]');
    await expect(resDiff).toBeVisible();
    await resDiff.click();

    // Launch Game
    await page.locator('[data-testid="btn-level-launch"]').click();
    await expect(page.locator('#modal-container')).toBeHidden();

    // Resident starting ATP is 450
    await expect(page.locator('[data-testid="hud-atp"]')).toHaveText('450');
  });
});
