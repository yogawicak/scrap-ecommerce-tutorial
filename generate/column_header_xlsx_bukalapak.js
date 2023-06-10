const fsPromises = require("fs/promises");

(async () => {
  try {
    const data = JSON.parse(
      await fsPromises.readFile(
        process.cwd() +
          "/log/raw_json/bukalapak_result_data_baju_978f037e-d6b4-4973-a912-6fb724b4eec2_page1.json",
        "utf8"
      )
    );
    const keyColumn = [];
    for (const key in data["collections"]["products"][0]) {
      console.log(key, "keyyyy");
      keyColumn.push({ key, header: key });
    }

    // shop data

    console.log(keyColumn, "dataa"); // copy to tokopedia.json worksheet.column
  } catch (error) {
    console.error(error);
  }
})();
