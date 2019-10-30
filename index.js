let gzipedString = "H4sIAAAAAAAAABWNTQrCMBgFX/pnEgTPFKriwjbQjetPEkugtZKkqCfqPXowMd0+ZuZJQIA5CYBlyJxhFUNZT/MzMok8Up9DXJyx54H6kKifxM648BroK1BcJ2/55mK/Lo91GWrdNLrlKFoaLXgalffTGxKH0yd6UjF6d5+jDXx7Q6m6Tt+ADNWRRuptiuEPd3cSWpUAAAA=";

class NBT {
    constructor (src) {
        const zlib = require("zlib");

        if (typeof src === "string") {
            src = Buffer.from(src, "base64")
        }

        this.unzipped = zlib.gunzipSync(src);
    }
    getString () {
        return this.toString();
    }
    toString () {
        return this.unzipped; //
    }
}

console.log(new NBT(gzipedString).toString().toString());
