import os
from pathlib import Path

from playwright.sync_api import sync_playwright


def main() -> None:
    output = Path("test-results/overview-ui-smoke.png")
    output.parent.mkdir(exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 980}, device_scale_factor=1)
        page.goto(os.environ.get("MATRIX_COMPASS_UI_URL", "http://127.0.0.1:3101"), wait_until="networkidle")
        assert page.get_by_text("内容航向").is_visible()
        assert page.get_by_role("button", name="立即同步").is_visible()
        assert page.get_by_text("作品表现轨迹").is_visible()
        page.screenshot(path=str(output), full_page=True)
        browser.close()


if __name__ == "__main__":
    main()
