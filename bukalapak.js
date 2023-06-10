const fetch = require("node-fetch");
const fsPromises = require("fs/promises");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const ExcelJS = require("exceljs");
const fs = require("fs");
const { v4: uuid } = require("uuid");

(async () => {
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
    process.cwd() + `/excel/bukalapak/${query}_${requestId}.xlsx`
  );

  for (let index = 1; index <= totalPage; index++) {
    const url = `https://www.bukalapak.com/products?page=${index}&search%5Bkeywords%5D=${query}`;

    const response = await fetch(url, {
      header: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5552.0 Safari/537.36",
      },
    });
    const responseText = await response.text();

    // from html response we'll get script text based on text match `window.NODE_ENV = "production"`
    const dom = new JSDOM(responseText);
    const scriptsTag = dom.window.document.getElementsByTagName("script");
    let scriptTagIncludeProduct = "";
    for (const iterator of scriptsTag) {
      if (
        iterator.innerHTML.includes(`window.__INITIAL_PRODUCT_EXPLORER_STATE__`)
      ) {
        scriptTagIncludeProduct = iterator.innerHTML;
        break;
      }
    }

    let resultObjData = {};
    if (
      scriptTagIncludeProduct.match(
        /window.__INITIAL_PRODUCT_EXPLORER_STATE__=\{[\S\s]*\};/gm
      )
    ) {
      let match = scriptTagIncludeProduct
        .match(/window.__INITIAL_PRODUCT_EXPLORER_STATE__=\{[\S\s]*\};/gm)[0]
        .replace("window.__INITIAL_PRODUCT_EXPLORER_STATE__=", "")
        .replaceAll("undefined", `"undefined"`)
        .replaceAll(";", "");
      //   .replaceAll(`\/u002F`, "asdasd");
      // console.log(JSON.parse(match), "ff");

      // await fsPromises.writeFile("xxx.json", decodeURIComponent(match));
      await fsPromises.writeFile(
        // save to file, to easier debug data schema
        process.cwd() +
          `/log/raw_json/bukalapak_result_data_${query}_${requestId}_page${index}.json`,
        decodeURIComponent(match)
      );
      resultObjData = JSON.parse(decodeURIComponent(match));
      //   .replace(";", "")
      // match = match.replace("undefined", `"undefined"`);
      // //   .replace(/(\r\n|\n|\r)/gm, "");
      // console.log(JSON.parse(match), "fff");
    }

    const worksheet = workbook.addWorksheet(`Bukalapak Products Page ${index}`); // New Worksheet
    worksheet.state = "visible";

    // define what data that we'll save on column, based on tokopedia result json, i've generator for this in generate folder
    worksheet.columns = [
      { key: "id", header: "id" },
      { key: "name", header: "name" },
      { key: "for_sale", header: "for_sale" },
      { key: "max_quantity", header: "max_quantity" },
      { key: "stock", header: "stock" },
      { key: "category", header: "category" },
      { key: "condition", header: "condition" },
      { key: "price", header: "price" },
      { key: "url", header: "url" },
      { key: "deal", header: "deal" },
      { key: "discount_subsidy", header: "discount_subsidy" },
      { key: "discount_percentage", header: "discount_percentage" },
      { key: "original_price", header: "original_price" },
      { key: "specs", header: "specs" },
      { key: "images", header: "images" },
      { key: "rating", header: "rating" },
      { key: "sku_id", header: "sku_id" },
      { key: "min_quantity", header: "min_quantity" },
      { key: "wholesales", header: "wholesales" },
      { key: "store", header: "store" },
      { key: "stats", header: "stats" },
      { key: "digital_product", header: "digital_product" },
      { key: "created_at", header: "created_at" },
      { key: "assurance", header: "assurance" },
      { key: "shipping", header: "shipping" },
      { key: "special_campaign_id", header: "special_campaign_id" },
      { key: "without_shipping", header: "without_shipping" },
      { key: "position_order", header: "position_order" },
      { key: "position_type", header: "position_type" },
      { key: "cartQuantity", header: "cartQuantity" },
      { key: "isLoading", header: "isLoading" },
      { key: "wholesale", header: "wholesale" },
      { key: "free_shipping", header: "free_shipping" },
      { key: "search_query_id", header: "search_query_id" },
      { key: "position_type_order", header: "position_type_order" },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    console.log(resultObjData, "res obj data");

    for (const iterator of resultObjData.collections.products) {
      let input = {};

      for (const columns of worksheet.columns) {
        input[columns.key] = iterator[columns.key];

        // console.log(input);
      }
      worksheet.addRow(input);
    }
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

  //   console.log(scriptTagIncludeProduct, "ff");

  //   await fsPromises.writeFile(
  //     process.cwd() + `/log/raw_html/bukalapak_${requestId}.html`,
  //     responseText
  //   );
})();
