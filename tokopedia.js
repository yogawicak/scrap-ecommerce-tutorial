require("dotenv").config();
const puppeteer = require("puppeteer-extra").default;
const fsPromises = require("fs/promises");
const fs = require("fs");
const jsdom = require("jsdom");
const ExcelJS = require("exceljs");
const { argv } = require("node:process");
const { JSDOM } = jsdom;
const { v4: uuid } = require("uuid");
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

(async () => {
  try {
    const requestId = uuid();

    const optionator = require("optionator")({
      options: [
        {
          option: "query",
          type: "String",
          description: "target",
        },
        {
          option: "totalPage",
          type: "Number",
          description: "target",
        },
      ],
    });

    const argvOption = optionator.parse(process.argv);

    if (Object.keys(argvOption).length === 1) {
      console.error("Need supply argument --query & --totalPage");
      process.exit(1);
    }

    console.log(argvOption);
    let { query, totalPage } = argvOption;
    query = query.replace("_", "+");

    // write stream for exceljs
    const workbook = new ExcelJS.Workbook();
    const excelStream = fs.createWriteStream(
      process.cwd() + `/excel/tokopedia/${query}_${requestId}.xlsx`
    );

    // // launch browser
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

    for (let index = 1; index <= totalPage; index++) {
      const url = `https://www.tokopedia.com/search?page=${index}&q=${query}&source=universe&st=product&srp_component_id=02.02.01.01`;
      console.log(url, "url");
      const page = await browser.newPage();

      const response = await page.goto(url);
      const htmlRawText = await response.text();
      await fsPromises.writeFile(
        // save to file, to easier debug data schema
        process.cwd() +
          `/log/raw_html/tokopedia_search_product_raw_html_${query}_${requestId}_page${index}.html`,
        htmlRawText
      );

      // from html response we'll get script text based on text match `window.NODE_ENV = "production"`
      const dom = new JSDOM(htmlRawText);
      const scriptsTag = dom.window.document.getElementsByTagName("script");
      // console.log(scriptsTag, "fff");
      let scriptTagIncludeNODE_ENV = "";
      for (const iterator of scriptsTag) {
        if (iterator.innerHTML.includes(`window.NODE_ENV="production"`)) {
          scriptTagIncludeNODE_ENV = iterator.innerHTML;
          break;
        }
      }
      // console.log(scriptTagIncludeNODE_ENV, "ff");

      // check match with regex to get main data
      let resultObjData = {}; // result must be object
      if (scriptTagIncludeNODE_ENV.match(/window\.__cache=\{[\S\s]*;/gm)) {
        // after long research
        let match = scriptTagIncludeNODE_ENV // the result is string object js like `{xxx:"ffff",sss:123}`
          .match(/window\.__cache=\{[\S\s]*;/gm)[0]
          .replace("window.__cache=", "")
          .replace(/(\r\n|\n|\r)/gm, "")
          .replace(";", "");
        // .toString();

        await fsPromises.writeFile(
          // save to file, to easier debug data schema
          process.cwd() +
            `/log/raw_json/tokopedia_result_data_${query}_${requestId}_page${index}.json`,
          match
        );
        //   match = eval(`JSON.stringify(${match})`); // so we must convert to stringify using eval to be `{"xxx":"ffff","sss":123}`
        resultObjData = JSON.parse(match.replace(";", "")); // replace again, to avoid bug
        // and parse again to get pure object
      }

      // convert the data to excel

      const worksheet = workbook.addWorksheet(
        `Tokopedia Products Page ${index}`
      ); // New Worksheet
      worksheet.state = "visible";

      // define what data that we'll save on column, based on tokopedia result json, i've generator for this in generate folder
      worksheet.columns = [
        { key: "id", header: "id" },
        { key: "name", header: "name" },
        { key: "ads", header: "ads" },
        { key: "badges", header: "badges" },
        { key: "departmentId", header: "departmentId" },
        { key: "categoryBreadcrumb", header: "categoryBreadcrumb" },
        { key: "categoryId", header: "categoryId" },
        { key: "categoryName", header: "categoryName" },
        { key: "countReview", header: "countReview" },
        { key: "customVideoURL", header: "customVideoURL" },
        { key: "discountPercentage", header: "discountPercentage" },
        { key: "gaKey", header: "gaKey" },
        { key: "imageUrl", header: "imageUrl" },
        { key: "labelGroups", header: "labelGroups" },
        { key: "originalPrice", header: "originalPrice" },
        { key: "price", header: "price" },
        { key: "priceRange", header: "priceRange" },
        { key: "rating", header: "rating" },
        { key: "ratingAverage", header: "ratingAverage" },
        { key: "url", header: "url" },
        { key: "wishlist", header: "wishlist" },
        { key: "source_engine", header: "source_engine" },
        { key: "__typename", header: "__typename" },
        { key: "shop_id", header: "shop_id" },
        { key: "shop_url", header: "shop_url" },
        { key: "shop_name", header: "shop_name" },
        { key: "shop_city", header: "shop_city" },
        { key: "shop_isOfficial", header: "shop_isOfficial" },
        { key: "shop_isPowerBadge", header: "shop_isPowerBadge" },
      ];

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });

      // get AceSearchUnifyProductxxx from products array
      // console.log(resultObjData.products, "fff");
      for (const key in resultObjData) {
        // product data is avail on TopAdsProductxxxx object
        if (key.match(/AceSearchUnifyProduct[0-9]+/gm) && !key.includes(".")) {
          // console.log(key, "fff");
          const productData = resultObjData[key];
          let input = {};
          for (const columns of worksheet.columns) {
            if (columns.key.includes("shop")) {
              input[columns.key] =
                resultObjData[`$${key}.shop`][columns.key.replace("shop_", "")];
            } else {
              input[columns.key] = productData[columns.key];
            }

            // console.log(columns, "columnsss");
          }
          // console.log(input, "inputt");
          worksheet.addRow(input);
        }
      }

      // console.log("FINISH");
      await page.close();
    }

    workbook.xlsx
      .write(excelStream)
      .then(function () {
        console.log(`File: ${query} saved!`);
        excelStream.end();
      })
      .catch((error) => {
        console.error(`File: ${query} save failed: `, error);
      });

    await browser.close();
  } catch (error) {
    // console.log(error);
    console.error(error);
  }
})();
