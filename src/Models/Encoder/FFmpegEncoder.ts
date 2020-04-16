import { IMusicEncoder } from "./IMusicEncoder";
import { Readable, Stream, Duplex, PassThrough, Writable, Transform } from 'stream';
import fs from 'fs';
import prism from 'prism-media';
import { OpusStream } from "prism-media/typings/opus";
export class FFmpegEncoder implements IMusicEncoder{

    encode(stream: Readable): Readable {

    //    const transcoder = new prism.FFmpeg({
    //     args: [
    //         '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
    //         '-f', 's16le',
    //         '-ar', '48000',
    //         '-ac', '2'
    //         ]
    //    });
    //    const opus = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
     //  return stream.pipe(transcoder).pipe(opus);
     return stream;
    }

}