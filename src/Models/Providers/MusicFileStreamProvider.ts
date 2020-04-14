import { IMusicStreamProvider } from "./IMusicStreamProvider";
import { Readable } from "stream";
import { FFmpegEncoder } from "../Encoder/FFmpegEncoder";

var fs = require("fs");
export class MusicFileStreamProvider implements IMusicStreamProvider{
    private readonly _encoder : FFmpegEncoder = new FFmpegEncoder();


    GetStreamForUri(uri: String): Readable {
        const stream = fs.createReadStream(uri);
        return this._encoder.encode(stream) as any;
    }


}