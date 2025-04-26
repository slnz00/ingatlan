import { sleep } from 'utils/async.utils';
import { Page } from 'rebrowser-puppeteer-core'

export const waitForSelector = async (
  selector: string,
  options: {
    page: Page,
    timeout?: number,
    checkInterval?: number
  }
) => {
  const { page, timeout = 5000, checkInterval = 100 } = options;
  const now = () => new Date().getTime();
  const timesOutAt = now() + timeout;

  while (true) {
    const exists = await page
      .$eval(selector, () => true)
      .catch(() => false);

    if (exists) {
      return;
    }

    if (now() > timesOutAt) {
      throw new Error(`Waiting for selector timed out, selector: "${selector}"`);
    }

    await sleep(checkInterval)
  }
}
