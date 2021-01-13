import { IMusicEncoder } from "./IMusicEncoder";
import { Readable, Stream, Duplex, PassThrough, Writable, Transform } from 'stream';
import fs from 'fs';
import prism from 'prism-media';
import { OpusStream } from "prism-media/typings/opus";
import { FXStream } from "./FXStream";
export class FFmpegEncoder implements IMusicEncoder{

    private _transcoder : prism.FFmpeg;
    /*
        Creates a ffmpeg opus stream with loudness normalization
        [IN] Media stream (youtube)
        [OUT] Opus Stream
    */
    encode(stream: Readable): Readable {

        const transcoder = new prism.FFmpeg({
         args: [
            '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
             '-f', 's16le',
             '-ar', '48000',
             '-ac', '2'
             ]
        });

        /*const transcoder2 = new prism.FFmpeg({
            args: [
               '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                '-f', 's16le',
                '-ar', '48000',
                '-ac', '2',
                '-i', '/workspaces/music-tendency/assets/sounds/rain.ogg',
                '-filter_complex', 'amerge=inputs=2',
                ]
           });*/

        const opus = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
        this._transcoder = transcoder;
        let test = stream.pipe(this._transcoder).pipe(opus);
       //return test;
     return stream;
    }

    testStuff(){
    }

}