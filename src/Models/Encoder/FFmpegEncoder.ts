import { IMusicEncoder } from "./IMusicEncoder";
import { Readable, Stream, Duplex, PassThrough, Writable, Transform } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import prism from 'prism-media';
export class FFmpegEncoder implements IMusicEncoder{

    encode(stream: Readable): Readable {

       const transcoder = new prism.FFmpeg({
        args: [
            '-af', 'loudnorm=I=-23:TP=-2:LRA=7',
            '-c:a', 'libopus',
            '-f', 'ogg',
            '-ar', '48000',
            '-ac', '2'
            ]
       });
        return stream;
    }
}