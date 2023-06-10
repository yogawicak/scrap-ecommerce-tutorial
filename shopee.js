require("dotenv").config();
const puppeteer = require("puppeteer-extra").default;
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fsPromises = require("fs/promises");
const { v4: uuid } = require("uuid");
puppeteer.use(StealthPlugin());
const ExcelJS = require("exceljs");
const fs = require("fs");

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
      process.cwd() + `/excel/shopee/${query}_${requestId}.xlsx`
    );

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

    for (let index = 0; index < totalPage; index++) {
      const url = `https://shopee.co.id/search?keyword=${query}&page=${index}`;
      // const element = totalPage;
      const page = await browser.newPage();

      const worksheet = workbook.addWorksheet(`Shopee Products Page ${index}`); // New Worksheet
      worksheet.state = "visible";

      // define what data that we'll save on column, based on tokopedia result json, i've generator for this in generate folder
      worksheet.columns = [
        { key: "itemid", header: "itemid" },
        { key: "shopid", header: "shopid" },
        { key: "name", header: "name" },
        { key: "label_ids", header: "label_ids" },
        { key: "image", header: "image" },
        { key: "images", header: "images" },
        { key: "currency", header: "currency" },
        { key: "stock", header: "stock" },
        { key: "status", header: "status" },
        { key: "ctime", header: "ctime" },
        { key: "sold", header: "sold" },
        { key: "historical_sold", header: "historical_sold" },
        { key: "liked", header: "liked" },
        { key: "liked_count", header: "liked_count" },
        { key: "view_count", header: "view_count" },
        { key: "catid", header: "catid" },
        { key: "brand", header: "brand" },
        { key: "cmt_count", header: "cmt_count" },
        { key: "flag", header: "flag" },
        { key: "cb_option", header: "cb_option" },
        { key: "item_status", header: "item_status" },
        { key: "price", header: "price" },
        { key: "price_min", header: "price_min" },
        { key: "price_max", header: "price_max" },
        {
          key: "price_min_before_discount",
          header: "price_min_before_discount",
        },
        {
          key: "price_max_before_discount",
          header: "price_max_before_discount",
        },
        { key: "hidden_price_display", header: "hidden_price_display" },
        { key: "price_before_discount", header: "price_before_discount" },
        {
          key: "has_lowest_price_guarantee",
          header: "has_lowest_price_guarantee",
        },
        { key: "show_discount", header: "show_discount" },
        { key: "raw_discount", header: "raw_discount" },
        { key: "discount", header: "discount" },
        { key: "is_category_failed", header: "is_category_failed" },
        { key: "size_chart", header: "size_chart" },
        { key: "video_info_list", header: "video_info_list" },
        { key: "tier_variations", header: "tier_variations" },
        { key: "item_rating", header: "item_rating" },
        { key: "item_type", header: "item_type" },
        { key: "reference_item_id", header: "reference_item_id" },
        {
          key: "transparent_background_image",
          header: "transparent_background_image",
        },
        { key: "is_adult", header: "is_adult" },
        { key: "badge_icon_type", header: "badge_icon_type" },
        { key: "shopee_verified", header: "shopee_verified" },
        { key: "is_official_shop", header: "is_official_shop" },
        {
          key: "show_official_shop_label",
          header: "show_official_shop_label",
        },
        {
          key: "show_shopee_verified_label",
          header: "show_shopee_verified_label",
        },
        {
          key: "show_official_shop_label_in_title",
          header: "show_official_shop_label_in_title",
        },
        {
          key: "is_cc_installment_payment_eligible",
          header: "is_cc_installment_payment_eligible",
        },
        {
          key: "is_non_cc_installment_payment_eligible",
          header: "is_non_cc_installment_payment_eligible",
        },
        { key: "coin_earn_label", header: "coin_earn_label" },
        { key: "show_free_shipping", header: "show_free_shipping" },
        { key: "preview_info", header: "preview_info" },
        { key: "coin_info", header: "coin_info" },
        { key: "exclusive_price_info", header: "exclusive_price_info" },
        { key: "bundle_deal_id", header: "bundle_deal_id" },
        { key: "can_use_bundle_deal", header: "can_use_bundle_deal" },
        { key: "bundle_deal_info", header: "bundle_deal_info" },
        { key: "is_group_buy_item", header: "is_group_buy_item" },
        { key: "has_group_buy_stock", header: "has_group_buy_stock" },
        { key: "group_buy_info", header: "group_buy_info" },
        { key: "welcome_package_type", header: "welcome_package_type" },
        { key: "welcome_package_info", header: "welcome_package_info" },
        { key: "add_on_deal_info", header: "add_on_deal_info" },
        { key: "can_use_wholesale", header: "can_use_wholesale" },
        {
          key: "is_preferred_plus_seller",
          header: "is_preferred_plus_seller",
        },
        { key: "shop_location", header: "shop_location" },
        {
          key: "has_model_with_available_shopee_stock",
          header: "has_model_with_available_shopee_stock",
        },
        { key: "voucher_info", header: "voucher_info" },
        { key: "can_use_cod", header: "can_use_cod" },
        { key: "is_on_flash_sale", header: "is_on_flash_sale" },
        { key: "spl_installment_tenure", header: "spl_installment_tenure" },
        { key: "is_live_streaming_price", header: "is_live_streaming_price" },
        { key: "is_mart", header: "is_mart" },
        { key: "pack_size", header: "pack_size" },
        { key: "deep_discount_skin", header: "deep_discount_skin" },
        { key: "is_service_by_shopee", header: "is_service_by_shopee" },
        {
          key: "spl_repayment_label_repayment",
          header: "spl_repayment_label_repayment",
        },
        {
          key: "spl_repayment_label_text",
          header: "spl_repayment_label_text",
        },
        { key: "highlight_video", header: "highlight_video" },
        { key: "free_shipping_info", header: "free_shipping_info" },
        { key: "global_sold_count", header: "global_sold_count" },
        { key: "wp_eligibility", header: "wp_eligibility" },
      ];

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });

      page.on("response", async (res) => {
        //
        if (res.url().includes("/api/v4/search/search_items")) {
          // console.log(await res.text(), "fff");
          const data = await res.json();
          await fsPromises.writeFile(
            // save to file, to easier debug data schema
            process.cwd() +
              `/log/raw_json/shopee_result_data_${query}_${requestId}_page_${index}.json`,
            JSON.stringify(data)
          );

          for (const iterator of data.items) {
            let input = {};
            for (const column of worksheet.columns) {
              // console.log(iterator.item_basic);
              input[column.key] = iterator.item_basic[column.key];
            }
            // console.log(input, "inputtt");
            worksheet.addRow(input);
          }
        }
      });

      await page.goto(url, { waitUntil: "networkidle2" });
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
    console.error(error);
  }
})();

// using
