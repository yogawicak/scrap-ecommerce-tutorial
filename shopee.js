require("dotenv").config();
const puppeteer = require("puppeteer-extra").default;
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fsPromises = require("fs/promises");
puppeteer.use(StealthPlugin());
puppeteer.use(
  require("puppeteer-extra-plugin-user-preferences")({
    userPrefs: {
      download: {
        prompt_for_download: false,
        open_pdf_in_system_reader: false,
      },
      plugins: {
        always_open_pdf_externally: false,
      },
    },
  })
);

(async () => {
  try {
    const url = `https://shopee.co.id/search?keyword=kursi%20gaming%20rexus`;

    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5552.0 Safari/537.36`,
        // "--proxy-server=103.132.52.57:8080",
      ],
      // devtools: false,
      product: "chrome",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      // executablePath: "/opt/homebrew/bin/chromium",
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    // await page.setRequestInterception(true);
    // page.on("request", (req) => {
    //   console.log(req.url(), "URLL");
    //   req.continue();
    // });

    page.on("response", async (res) => {
      //
      if (res.url().includes("/api/v4/search/search_items")) {
        // console.log(await res.text(), "fff");
        const data = await res.text();
        await fsPromises.writeFile("shopee_search_item.json", data);
      }
    });

    await page.goto(url, { waitUntil: "networkidle2" });
    // console.log(await response.text(), "fff");

    // await fsPromises.writeFile("shopee.html", await response.text());

    await browser.close();
  } catch (error) {
    console.error(error);
  }
})();

// using
