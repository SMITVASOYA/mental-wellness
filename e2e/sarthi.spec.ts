import { test, expect } from "@playwright/test";

test.describe("Sarthi Student Wellness E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto("/");
  });

  test("should load and display Sarthi cockpit with default profile", async ({ page }) => {
    // Check main title
    await expect(page.locator("h1")).toContainText("Sarthi");
    
    // Check that default profile name is visible
    await expect(page.locator("h2")).toContainText("Welcome back, Aspirant");
  });

  test("should toggle between cockpit tabs correctly", async ({ page }) => {
    // 1. Navigate to Log Mind Balance
    await page.click('button[role="tab"]:has-text("Log Mind Balance")');
    await expect(page.locator("#mood-logger-card")).toBeVisible();

    // 2. Navigate to Notebook
    await page.click('button[role="tab"]:has-text("Notebook")');
    await expect(page.locator("#journal-notebook-card")).toBeVisible();

    // 3. Navigate to Companion Chat
    await page.click('button[role="tab"]:has-text("Companion Chat")');
    await expect(page.locator("#companion-chat-card")).toBeVisible();

    // 4. Navigate to Physiological Reset
    await page.click('button[role="tab"]:has-text("Physiological Reset")');
    await expect(page.locator("#breathing-reset-section")).toBeVisible();
  });

  test("should log mood and stress values and display them in cockpit", async ({ page }) => {
    // Go to mood logging tab
    await page.click('button[role="tab"]:has-text("Log Mind Balance")');
    
    // Type study note
    const testNote = "Solved 10 maths integration problems today.";
    await page.fill("#mood-note-input", testNote);
    
    // Toggle a context tag
    await page.click('button:has-text("Mock Exam Preparation")');

    // Submit log
    await page.click("#commit-mood-button");

    // Should redirect to Cockpit (Dashboard)
    await expect(page.locator("#student-cockpit-layout")).toBeVisible();

    // Verify the logged item is in the daily mind balance registers table
    await expect(page.locator("#mood-logs-table-section")).toContainText(testNote);
  });

  test("should run physiological reset session successfully", async ({ page }) => {
    // Go to breathing tab
    await page.click('button[role="tab"]:has-text("Physiological Reset")');
    
    // Verify default visual instructions are ready
    await expect(page.locator("#breathing-reset-section")).toContainText("Choose a pattern above");

    // Choose Calming 4-7-8 Loop style
    await page.click('button:has-text("Calming 4-7-8 Loop")');

    // Click Begin Deep Breathing
    await page.click('button:has-text("Begin Deep Breathing")');

    // Verify button text changes to Freeze Session
    await expect(page.locator('button:has-text("Freeze Session")')).toBeVisible();

    // Check that phase indicator shows "Inhale"
    await expect(page.locator("#breathing-reset-section")).toContainText("Breathe In Slowly...");
  });

  test("should allow text chatting with Sarthi companion coach", async ({ page }) => {
    // Go to companion chat tab
    await page.click('button[role="tab"]:has-text("Companion Chat")');

    // Input chat text
    const messageText = "I feel very overwhelmed about the physics mocks tomorrow.";
    await page.fill("#chat-message-input", messageText);
    
    // Click send
    await page.click("#send-chat-button");

    // Verify message appears in stream
    await expect(page.locator("#companion-chat-card")).toContainText(messageText);

    // Wait for Sarthi response bubble (using the accessible aria-label matching of the last element)
    const companionBubble = page.locator('[aria-label^="Sarthi message received"]').last();
    await expect(companionBubble).toBeVisible({ timeout: 15000 });
  });
});
