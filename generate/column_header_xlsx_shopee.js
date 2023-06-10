const fsPromises = require("fs/promises");

(async () => {
  try {
    const data = JSON.parse(
      await fsPromises.readFile(
        process.cwd() +
          "/log/raw_json/shopee_result_data_baju+anak_270342b8-0f84-407e-a098-87f70ee0d8d5_page_0.json",
        "utf8"
      )
    );
    const keyColumn = [];
    for (const key in data["items"][0]["item_basic"]) {
      console.log(key, "keyyyy");
      keyColumn.push({ key, header: key });
    }

    // shop data

    console.log(keyColumn, "dataa"); // copy to tokopedia.json worksheet.column
  } catch (error) {
    console.error(error);
  }
})();
