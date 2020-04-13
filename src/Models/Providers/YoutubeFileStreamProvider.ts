import { IMusicStreamProvider } from "./IMusicStreamProvider";

const ytdl = require('ytdl-core');

export class YoutubeFileStreamProvider implements IMusicStreamProvider{

    GetStreamForUri(uri: String): ReadableStream {

        let dlOptions = {quality: "highestaudio", filter: "audioonly"};
        return ytdl(uri as string, dlOptions);
    }

}