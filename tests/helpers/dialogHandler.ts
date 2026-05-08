import type { Dialog, Page } from '@playwright/test';

/**
 * PayForm surfaces both server errors AND success notifications via native
 * `window.alert()`. Arm this BEFORE the action that triggers the alert.
 */
export function waitForAlert(page: Page, timeoutMs = 5_000): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      page.off('dialog', handler);
      reject(new Error(`No alert dialog appeared within ${timeoutMs}ms`));
    }, timeoutMs);

    const handler = async (dialog: Dialog): Promise<void> => {
      clearTimeout(timer);
      page.off('dialog', handler);
      const text = dialog.message();
      await dialog.accept();
      resolve(text);
    };

    page.on('dialog', handler);
  });
}
