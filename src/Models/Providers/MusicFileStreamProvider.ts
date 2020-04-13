import { IMusicStreamProvider } from "./IMusicStreamProvider";

var fs = require("fs");
export class MusicFileStreamProvider implements IMusicStreamProvider{


    GetStreamForUri(uri: String): ReadableStream {
        const stream = fs.createReadStream(uri);
        return stream;
    }


}