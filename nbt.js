let NBT;

module.exports = NBT = class NBT {
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

class TagEnd {

}

class TagByte {

}

class TagShort {

}

class TagInt {

}

class TagLong {

}

class TagFloat {

}

class TagDouble {

}

class TagByteArray {

}

class TagString {

}

class TagList {

}

class TagCompound {

}

class TagIntArray {
    
}
