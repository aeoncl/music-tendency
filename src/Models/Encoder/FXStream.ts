import { Stream, TransformOptions, TransformCallback } from "stream";
import prism from 'prism-media';
import fs from 'fs';

export class FXStream extends Stream.Transform{

    private _ffmpeg : prism.FFmpeg;
    constructor(options? : TransformOptions) {
        super(options);

        this.openRainFile();
    }

    openRainFile(){
        this._ffmpeg = new prism.FFmpeg({
            args: [
               '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                '-f', 's16le',
                '-ar', '48000',
                '-ac', '2'
                ]
           });
           const rainFile = fs.createReadStream("././assets/sounds/rain.ogg");
           rainFile.pipe(this._ffmpeg);
           
    }

    _transform(data: any, encoding: string, callback: TransformCallback){
        
        this.push(data);
        callback();
    }


  _destroy(err:any, cb:TransformCallback) {
    super._destroy(err, cb);
  }

}
