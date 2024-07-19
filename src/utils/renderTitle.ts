import gradient from "gradient-string";

import { TITLE_TEXT } from "~/consts.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";

const zohoTheme = {
  red: "#E42527",
  green: "#089949",
  blue: "#226DB4",
  yellow: "#F9B21D",
};

export const renderTitle = () => {
  const g = gradient(Object.values(zohoTheme));

  // resolves weird behavior where the ascii is offset
  const pkgManager = getUserPkgManager();
  if (pkgManager === "yarn" || pkgManager === "pnpm") {
    console.log("");
  }
  console.log(g.multiline(TITLE_TEXT));
};
