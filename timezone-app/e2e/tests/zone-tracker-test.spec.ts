import { Locator, Page, test, BrowserContext, Browser, expect } from '@playwright/test';
import { ZoneTrackerPage } from '../page-objects/zone-tracker-page';

// Test to verify if the page title and local time label are correctly displayed.
test('#1. Verify page title and local time label', async ({ page }) => {
  // Navigate to the application URL
  await page.goto('localhost:3000');
  // Check if the page title is 'Time Keeper'
  await expect(page).toHaveTitle('Time Keeper');
  // Verify that 'Local(You)' text is present in the table body
  await expect(page.locator('tbody')).toContainText('Local(You)');
});

// Test suite for adding and verifying multiple time zones
test.describe('#2. Multiple Time Zones Addition Test', () => {
  let trackerPage: ZoneTrackerPage;

  // Initialize the ZoneTrackerPage object before each test in this suite
  test.beforeEach(async ({ page }) => {
    trackerPage = new ZoneTrackerPage(page);
    // Navigate to the home page before each test
    await trackerPage.navigateToHomePage();
  });

  // Test to verify the visibility of current time in different time zones
  test('verify current time visibility in different zones', async () => {
    // Define test data for a timezone
    const label = 'Los Angeles Zone';
    const dropdownOption = 'Pacific Standard Time';
    const timezoneValue = 'America/Los_Angeles';

    // Add the timezone and perform assertions
    await trackerPage.addZone(label, dropdownOption);
    await expect(trackerPage.findRowWithText(label)).toBeVisible();
    await expect(trackerPage.findRowWithText(timezoneValue)).toBeVisible();
    const timeInZone = trackerPage.getCurrentTime(timezoneValue);
    await expect(trackerPage.findRowWithText(timeInZone)).toBeVisible();
  });
});

// Test suite for verifying the sorting functionality of time zones
test.describe('#3. Timezone Sorting Verification', () => {
  let trackerPage: ZoneTrackerPage;

  // Initialize the ZoneTrackerPage object for each test in this suite
  test.beforeEach(({ page }) => {
    trackerPage = new ZoneTrackerPage(page);
  });

  // Test to verify that time zones are sorted correctly
  test('verify timezone sorting order', async () => {
    await trackerPage.navigateToHomePage();
    // Add multiple time zones
    await trackerPage.addZone('Hawaii Friend', 'Hawaii-Aleutian Standard Time');
    await trackerPage.addZone('Alaska Friend', 'Alaska Standard Time');
  
    // Verify the order of the time zones
    await expect(trackerPage._page.getByRole('row').nth(1)).toContainText('Alaska Friend');
    await expect(trackerPage._page.getByRole('row').nth(2)).toContainText('Hawaii Friend');
    await expect(trackerPage._page.getByRole('row').nth(3)).toContainText('Local(You)');
  });
});

// Test suite for testing the deletion functionality of time zones
test.describe('#4. Timezone Deletion Functionality', () => {
  let trackerPage: ZoneTrackerPage;

    // Setup for each test in the timezone deletion suite
    test.beforeEach(({ page }) => {
        trackerPage = new ZoneTrackerPage(page);
      });
    
      // Test to check if a single timezone record can be successfully deleted
      test('a. deletes a single timezone record successfully', async () => {
        // Prepare test data
        const label = 'Alaska Friend';
        const dropdownOption = 'Alaska Standard Time';
    
        // Navigate and add a timezone
        await trackerPage.navigateToHomePage();
        const startRowCount = await trackerPage._page.getByRole('row').count();
    
        await trackerPage.addZone(label, dropdownOption);
        const postCreationRowCount = await trackerPage._page.getByRole('row').count();
        // Verify the row count has increased by 1 after addition
        expect(postCreationRowCount).toBe(startRowCount + 1);
    
        // Delete the created timezone and verify its deletion
        const createdRow: Locator = trackerPage.findRowWithText(label);
        await createdRow.getByRole('button', { name: 'Delete' }).click();
        const postDeletionRowCount = await trackerPage._page.getByRole('row').count();
        expect(postDeletionRowCount).toBe(startRowCount);
        await expect(trackerPage.findRowWithText(label)).not.toBeVisible();
    
        // Ensure the 'Local(You)' record still exists
        await expect(trackerPage.findRowWithText('Local(You)')).toBeVisible();
      });
    
      // Test to ensure the 'Local (You)' record cannot be deleted
      test('b. verifies the incapability to delete the Local (You) record', async() => {
        await trackerPage.navigateToHomePage();
        // Locate the 'Local (You)' row and attempt to delete
        const youRow = trackerPage.findRowWithText('Local(You)');
        const deleteButton = youRow.getByRole('button', { name: 'Delete' });
    
        // Confirm the delete button is disabled
        await expect(deleteButton).toBeDisabled();
      });
    });
    
    // Test suite for a comprehensive verification of adding multiple timezones
    test.describe('#5. Comprehensive Timezone Addition Verification', () => {
      let browser: Browser;
      let context: BrowserContext;
      let page: Page;
      let trackerPage: ZoneTrackerPage;
    
      // Setup a single browser context for all tests in this suite
      test.beforeAll(async ({ browser: browserInstance }) => {
        browser = browserInstance;
        context = await browser.newContext();
        page = await context.newPage();
        trackerPage = new ZoneTrackerPage(page);
        await trackerPage.navigateToHomePage();
      });
    
      // Clean up after all tests in this suite
      test.afterAll(async () => {
        await context.close();
      });
    
      // Test data representing various timezones
      const timezones = [
        { label: "Eastern Standard Time", value: "America/New_York" },
        { label: "Central Standard Time", value: "America/Chicago" },
        { label: "Mountain Standard Time", value: "America/Denver" },
        { label: "Pacific Standard Time", value: "America/Los_Angeles" },
        { label: "Alaska Standard Time", value: "America/Juneau" },
        { label: "Hawaii-Aleutian Standard Time", value: "Pacific/Honolulu" },
      ];
    
      // Loop through each timezone and perform addition and verification
      for (const timezone of timezones) {
        test(`verify addition for ${timezone.label}`, async () => {
          // Prepare test data for each timezone
          const zoneLabel = `${timezone.label} Office`;
          const dropdownSelection = timezone.label;
          const timezoneValue = timezone.value;
    
          // Add the timezone and perform verifications
          await trackerPage.addZone(zoneLabel, dropdownSelection);
          await expect(trackerPage.findRowWithText(zoneLabel)).toBeVisible();
          await expect(trackerPage.findRowWithText(timezoneValue)).toBeVisible();
          const timeInZone = trackerPage.getCurrentTime(timezoneValue);
          await expect(trackerPage.findRowWithText(timeInZone)).toBeVisible();
        });
      }
    });
    
