import { IMusicStreamProvider } from "./IMusicStreamProvider";
import { FFmpegEncoder } from "../Encoder/FFmpegEncoder";
import { Readable } from "stream";

const ytdl = require('ytdl-core');

export class YoutubeFileStreamProvider implements IMusicStreamProvider{


    private readonly _encoder : FFmpegEncoder = new FFmpegEncoder();

    GetStreamForUri(uri: String): Readable {

        let dlOptions = {quality: "highestaudio", filter: "audioonly"};
        return this._encoder.encode(ytdl(uri as string, dlOptions)) as any;
    }

}