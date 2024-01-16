import { Page, Locator, expect } from '@playwright/test';

// ZoneTrackerPage class to encapsulate operations and interactions on the timezone tracking page
export class ZoneTrackerPage {
  // Private properties representing various elements on the page
  private _page:              Page;
  private _addZoneButton:     Locator;
  private _zoneLabelField:    Locator;
  private _zoneSelector:      Locator;
  private _confirmButton:     Locator;

  // Constructor initializes the page elements locators
  constructor(page: Page) {
    this._page             = page;
    this._addZoneButton    = page.getByRole('button', { name: 'Add timezone' });
    this._zoneLabelField   = page.locator('input#label');
    this._zoneSelector     = page.locator('select#timezone');
    this._confirmButton    = page.getByRole('button', { name: 'Save' });
  }

  // Method to navigate to the homepage and perform initial assertions
  async navigateToHomePage() {
    await this._page.goto('http://localhost:3000');
    // Asserting the presence of 'Local(You)' text in the page
    await expect(this._page.locator('div.font-medium')).toHaveText('Local(You)');

    // Get local time in America/Toronto and assert its visibility
    const localTime: string = this.getCurrentTime('America/Toronto')
    await expect(this.findRowWithText(localTime)).toBeVisible();
  }

  // Method to find a table row that contains the specified text
  findRowWithText(textQuery: string, exact: boolean = true): Locator {
    // Locating a table row based on the presence of a cell with specific text.
    return this._page.getByRole('row').filter(
      { has: this._page.getByRole('cell', { name: textQuery }) }
    );
  }

  // Utility method to get the current time in a specified timezone
  getCurrentTime(timeZone: string): string {
    // Returns the time as a string in the specified timezone
    return new Date().toLocaleTimeString("en-US", { timeZone, timeStyle: 'short' })
  }

  // Method to add a new timezone record on the page
  async addZone(label: string, timezone: string) {
    // Sequence of actions to add a new timezone: click button, fill form, and submit
    await this._addZoneButton.click();
    await this._zoneLabelField.fill(label);
    await this._zoneSelector.selectOption( { label: timezone } )
    await this._confirmButton.click();
  }
}
