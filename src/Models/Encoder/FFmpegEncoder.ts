import { IMusicEncoder } from "./IMusicEncoder";
import { Readable, Stream, Duplex, PassThrough, Writable, Transform } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import prism from 'prism-media';
export class FFmpegEncoder implements IMusicEncoder{

    encode(stream: Readable): Readable {

       const transcoder = new prism.FFmpeg({
        args: [
            '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,volume=-5dB',
            '-f', 's16le',
            '-ar', '48000',
            '-ac', '2'
        ]
       });

       const opus = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });

        return stream.pipe(transcoder).pipe(opus);
    }
}