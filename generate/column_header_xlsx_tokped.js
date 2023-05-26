const fsPromises = require("fs/promises");

(async () => {
  try {
    const data = JSON.parse(
      await fsPromises.readFile(process.cwd() + "/result_data.json", "utf8")
    );
    const keyColumn = [];
    for (const key in data["AceSearchUnifyProduct8216378364"]) {
      console.log(key, "keyyyy");
      keyColumn.push({ key, header: key });
    }

    // shop data
    keyColumn.push(
      { key: "shop_id", header: "shop_id" },
      { key: "shop_url", header: "shop_url" },
      { key: "shop_name", header: "shop_name" },
      { key: "shop_city", header: "shop_city" },
      { key: "shop_isOfficial", header: "shop_isOfficial" },
      { key: "shop_isPowerBadge", header: "shop_isPowerBadge" }
    );

    console.log(keyColumn, "dataa"); // copy to tokopedia.json worksheet.column
  } catch (error) {
    console.error(error);
  }
})();
