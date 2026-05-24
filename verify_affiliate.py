import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 2000})
        await page.goto('http://localhost:8000')

        # Toggle dark mode
        await page.click('.theme-toggle')

        # Scroll to bottom slowly to trigger animations
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(1000)

        # Scroll to affiliate section explicitly
        await page.locator('.affiliate-section').first.scroll_into_view_if_needed()
        await page.wait_for_timeout(500)

        await page.locator('.affiliate-section').screenshot(path='/home/jules/verification/screenshots/affiliate_note_section_dark.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
