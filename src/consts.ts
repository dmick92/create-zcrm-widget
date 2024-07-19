import path from "path";
import { fileURLToPath } from "url";

// With the move to TSUP as a build tool, this keeps path routes in other files (installers, loaders, etc) in check more easily.
// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");

//export const PKG_ROOT = path.dirname(require.main.filename);

export const TITLE_TEXT = `
  ___ __  _  _  __     ______ __ __   _   _  _ __   __ ___ _____  
 |_  /__\\| || |/__\\   / _/ _ \\  V  | | | | || | _\\ / _] __|_   _| 
  / / \\/ | >< | \\/ | | \\_| v / \\_/ | | 'V' || | v | [/\\ _|  | |   
 |___\\__/|_||_|\\__/   \\__/_|_\\_| |_| !_/ \\_!|_|__/ \\__/___| |_|
`;
export const DEFAULT_APP_NAME = "my-zcrm-widget";
export const CREATE_ZCRM_WIDGET = "create-zcrm-widget";
