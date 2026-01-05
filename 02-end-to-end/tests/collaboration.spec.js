import { test, expect } from '@playwright/test';

const editorLocator = '.cm-content';

test('synchronizes code between two clients', async ({ browser, baseURL }) => {
  const roomId = `room-${Date.now()}`;
  const context = await browser.newContext({ baseURL });
  const page1 = await context.newPage();
  const page2 = await context.newPage();

  await page1.goto(`/s/${roomId}`);
  await page2.goto(`/s/${roomId}`);

  await expect(page1.getByText(/Status: connected/i)).toBeVisible({ timeout: 15000 });
  await expect(page2.getByText(/Status: connected/i)).toBeVisible({ timeout: 15000 });

  const editor1 = page1.locator(editorLocator).first();
  await editor1.click();
  await editor1.type('console.log("hello from p1");');

  const editor2 = page2.locator(editorLocator).first();
  await expect(editor2).toContainText('console.log("hello from p1");', { timeout: 15000 });

  await context.close();
});

test('executes JavaScript and shows output', async ({ page, baseURL }) => {
  const roomId = `run-${Date.now()}`;
  await page.goto(`/s/${roomId}`);
  await expect(page.getByText(/Status: connected/i)).toBeVisible({ timeout: 15000 });

  const editor = page.locator(editorLocator).first();
  await editor.click();
  await editor.type('console.log("hello world");');

  await page.getByRole('button', { name: /run/i }).click();
  await expect(page.locator('.output')).toContainText('hello world');
});

test('executes Python via Pyodide', async ({ page, baseURL }) => {
  test.skip(process.env.SKIP_PYODIDE_TEST, 'Pyodide fetch disabled');
  test.setTimeout(120000);
  const roomId = `py-${Date.now()}`;
  await page.goto(`/s/${roomId}`);
  await expect(page.getByText(/Status: connected/i)).toBeVisible({ timeout: 15000 });

  await page.getByRole('combobox').selectOption('python');

  const editor = page.locator(editorLocator).first();
  await editor.click();
  await editor.type('print("hi from python")');

  await page.getByRole('button', { name: /run/i }).click();
  await expect(page.locator('.output')).not.toHaveText(/Running\.\.\./, { timeout: 120000 });
  await expect(page.locator('.output')).toContainText('hi from python');
});
