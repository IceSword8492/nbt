import * as fs from 'fs'
import NBT from "./nbt"

let fname: string = __dirname + "/../data";
let gzip: string = fs.readFileSync(fname, "utf8");
gzip = decodeURI(gzip);

new NBT(gzip);
