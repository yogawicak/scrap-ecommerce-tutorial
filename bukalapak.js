const fetch = require("node-fetch");
const fsPromises = require("fs/promises");
const { v4: uuid } = require("uuid");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

(async () => {
  const requestId = uuid();
  const url = `https://www.bukalapak.com/products?from=omnisearch&from_keyword_history=false&search%5Bkeywords%5D=baju%20anak&search_source=omnisearch_keyword&source=navbar`;

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
    console.log(JSON.parse(match), "ff");

    await fsPromises.writeFile("xxx.json", decodeURIComponent(match));
    //   .replace(";", "")
    // match = match.replace("undefined", `"undefined"`);
    // //   .replace(/(\r\n|\n|\r)/gm, "");
    // console.log(JSON.parse(match), "fff");
  }

  //   console.log(scriptTagIncludeProduct, "ff");

  //   await fsPromises.writeFile(
  //     process.cwd() + `/log/raw_html/bukalapak_${requestId}.html`,
  //     responseText
  //   );
})();
