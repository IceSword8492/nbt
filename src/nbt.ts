import * as zlib from "zlib"

//  <object> ::=
//      <curly_l> <curly_r>
//      | <curly_l> <members> <curly>
//  <members> ::=
//      <string> <colon> <string>
//      | <members> <comma> <string> <colon> <value>
//  <array> ::=
//      <square_l> <square_r>
//      | <square_l> <elements> <square_r>
//  <elements> ::=
//      <value>
//      | <elements> <comma> <value>

export default class NBT {
    private Types: Array<string> = [
        "TAG_End",
        "TAG_Byte",
        "TAG_Short",
        "TAG_Int",
        "TAG_Long",
        "TAG_Float",
        "TAG_Double",
        "TAG_Byte_Array",
        "TAG_String",
        "TAG_List",
        "TAG_Compound",
        "TAG_Int_Array",
    ];

    private nbt: Buffer;
    private pos: number;

    constructor (src: string);
    constructor (src: Buffer);
    
    constructor (src: string | Buffer) {
        if (typeof src === "string") {
            src = Buffer.from(this.decodeUnicode(src), "base64");
        }

        this.nbt = zlib.gunzipSync(src);

        this.decode();
    }
    public setSource (src: string | Buffer): void {
        if (typeof src === "string") {
            src = Buffer.from(this.decodeUnicode(src), "base64");
        }

        this.nbt = zlib.gunzipSync(src);
    }
    private decode (): Object {
        let tokens = this.tokenize();
        return this.parse(tokens);
    }
    private parse (tokens: Array<Token>): Object {

        return null;
    }
    private tokenize (): Array<Token> {
        this.pos = 0;

        let tokens: Array<Token> = [];
        let t: Token = this.nextToken();
        while (t !== null) {
            tokens.push(t);
            t = this.nextToken();
        }
        return tokens;
    }
    private decodeUnicode (src: string): string {
        return src.replace(/\\u.{4}/g, (match: string): string => {
            match = match.replace("\\u", "0x");
            return String.fromCharCode(parseInt(match, 16));
        });
    }
    private isEOT (): boolean {
        return this.nbt.length <= this.pos;
    }
    private c (): number {
        return this.nbt[this.pos];
    }
    private next (): number {
        let c = this.c();
        ++this.pos;
        return c;
    }
    private nextToken (): Token {
        if (this.isEOT()) {
            return null;
        } else if (this.isTagEnd(this.c())) {
            return this.tagEnd();
        } else if (this.isTagByte(this.c())) {
            return this.tagByte();
        } else if (this.isTagShort(this.c())) {
            return this.tagShort();
        } else if (this.isTagInt(this.c())) {
            return this.tagInt();
        } else if (this.isTagLong(this.c())) {
            return this.tagLong();
        } else if (this.isTagFloat(this.c())) {
            return this.tagFloat();
        } else if (this.isTagDouble(this.c())) {
            return this.tagDouble();
        } else if (this.isTagByteArray(this.c())) {
            return this.tagByteArray();
        } else if (this.isTagString(this.c())) {
            return this.tagString();
        } else if (this.isTagList(this.c())) {
            return this.tagList();
        } else if (this.isTagCompound(this.c())) {
            return this.tagCompound();
        } else if (this.isTagIntArray(this.c())) {
            return this.tagIntArray();
        } else {
            throw new Error("unexpected token: 0x" + this.next().toString(16));
        }
    }
    private isTagEnd (c: number): boolean {
        return c === 0;
    }
    private isTagByte (c: number): boolean {
        return c === 1;
    }
    private isTagShort (c: number): boolean {
        return c === 2;
    }
    private isTagInt (c: number): boolean {
        return c === 3;
    }
    private isTagLong (c: number): boolean {
        return c === 4;
    }
    private isTagFloat (c: number): boolean {
        return c === 5;
    }
    private isTagDouble (c: number): boolean {
        return c === 6;
    }
    private isTagByteArray (c: number): boolean {
        return c === 7;
    }
    private isTagString (c: number): boolean {
        return c === 8;
    }
    private isTagList (c: number): boolean {
        return c === 9;
    }
    private isTagCompound (c: number): boolean {
        return c === 10;
    }
    private isTagIntArray (c: number): boolean {
        return c === 11;
    }
    private getTagLength (): number {
        return this.getNumber(2);
    }
    private getTagName (len: number): string {
        let v = "";
        for (let i = 0; i < len; i++) {
            v += String.fromCharCode(this.next());
        }
        return v;
    }
    private getNumber (len: number): number {
        let value: number = 0;
        for (let i = 0; i < len; i++) {
            value = (value << 8) + this.next();
        }
        return value;
    }
    private getByteArray (): Array<number> {
        let na: Array<number> = [];
        let len = this.getNumber(4);
        for (let i = 0; i < len; i++) {
            na.push(this.getNumber(1));
        }
        return na;
    }
    private getString (): string {
        let s: string = "";
        let len = this.getNumber(2);
        for (let i = 0; i < len; i++) {
            s += String.fromCharCode(this.next());
        }
        return s;
    }
    private getTagList (): Array<Token> {
        let ta: Array<Token> = [];
        let type: number = this.getNumber(1);
        let len = this.getNumber(4);
        for (let i = 0; i < len; i++) {
            if (type === 1) { // byte
                ta.push(new Token(this.Types[type], null, this.getNumber(1)));
            }
            if (type === 2) { // short
                ta.push(new Token(this.Types[type], null, this.getNumber(2)));
            }
            if (type === 3) { // int
                ta.push(new Token(this.Types[type], null, this.getNumber(4)));
            }
            if (type === 4) { // long
                ta.push(new Token(this.Types[type], null, this.getNumber(8)));
            }
            if (type === 5) { // float
                ta.push(new Token(this.Types[type], null, this.getNumber(4)));
            }
            if (type === 6) { // double
                ta.push(new Token(this.Types[type], null, this.getNumber(8)));
            }
            if (type === 7) { // bytearray
                ta.push(this.nextToken());
            }
            if (type === 8) { // string
                ta.push(new Token(this.Types[type], null, this.getString()));
            }
            if (type === 9) { // list 
                ta.push(this.nextToken());
            }
            if (type === 10) { // compound
                ta.push(this.nextToken());
            }
            if (type === 11) { // intarray
                ta.push(this.nextToken());
            }
        }
        return ta;
    }
    private getIntArray (): Array<number> {
        let na: Array<number> = [];
        let len = this.getNumber(4);
        for (let i = 0; i < len; i++) {
            na.push(this.getNumber(4));
        }
        return na;
    }
    private tagEnd (): Token {
        this.next();
        let t: Token = new Token();
        t.name = "TAG_End";
        return t;
    }
    private tagByte (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_Byte";
        t.name = this.getTagName(this.getTagLength());
        t.data = this.getNumber(1);
        return t;
    }
    private tagShort (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_Short";
        t.name = this.getTagName(this.getTagLength());
        t.data = this.getNumber(2);
        return t;
    }
    private tagInt (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_Int";
        t.name = this.getTagName(this.getTagLength());
        t.data = this.getNumber(4);
        return t;
    }
    private tagLong (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_Long";
        t.name = this.getTagName(this.getTagLength());
        t.data = this.getNumber(8);
        return t;
    }
    private tagFloat (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_Float";
        t.name = this.getTagName(this.getTagLength());
        t.data = this.getNumber(4);
        return t;
    }
    private tagDouble (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_Double";
        t.name = this.getTagName(this.getTagLength());
        t.data = this.getNumber(8);
        return t;
    }
    private tagByteArray (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_ByteArray";
        t.name = this.getTagName(this.getTagLength());
        t.data = this.getByteArray();
        return t;
    }
    private tagString (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_String";
        t.name = this.getTagName(this.getTagLength());
        t.data = this.getString();
        return t;
    }
    private tagList (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_List";
        t.name = this.getTagName(this.getTagLength());
        t.data = this.getTagList();
        return t;
    }
    private tagCompound (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_Compound";
        t.name = this.getTagName(this.getTagLength());
        return t;
    }
    private tagIntArray (): Token {
        this.next();
        let t: Token = new Token();
        t.type = "TAG_Int_Array";
        t.name = this.getTagName(this.getTagLength());
        t.data = this.getIntArray();
        return t;
    }
}

class Token {
    public type: string;
    public name: string;
    public data: string | number | Array<number> | Array<Token>;

    constructor ();
    constructor (type: string, name: string, data: string | number | Array<number> | Array<Token>);
    
    constructor (type?: any, name?: any, data?: any) {
        this.type = type;
        this.name = name;
        this.data = data;
    }
}
