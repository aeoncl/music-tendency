import { IMusicEncoder } from "./IMusicEncoder";
import { Readable, Stream, Duplex, PassThrough, Writable, Transform } from 'stream';
import fs from 'fs';
import prism from 'prism-media';
export class FFmpegEncoder implements IMusicEncoder{

    encode(stream: Readable): Readable {

       const transcoder = new prism.FFmpeg({
        args: [
            '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
            '-f', 'wav',
            '-ar', '48000',
            '-ac', '2'
            ]
       });
        return stream;
    }

}