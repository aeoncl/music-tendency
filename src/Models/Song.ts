import { IMusicStreamProvider } from "./Providers/IMusicStreamProvider";
import { MusicFileStreamProvider } from "./Providers/MusicFileStreamProvider";
import { Command } from "./Command";

export class Song{

    private readonly _duration : number;
    constructor(readonly uri : String, readonly title?: String, duration?: number | string, readonly command?: Command, readonly thumbnail?: String, readonly provider:IMusicStreamProvider = new MusicFileStreamProvider()){
        if(duration !== null && duration !== undefined){
            if(typeof duration !== 'number'){
                this._duration = this.ParseDateStringToSeconds(duration as string)
            }else{
                this._duration = duration as number;
            }
        }
    }

    get Title(){
        return this.title;
    }

    get Uri(){
        return this.uri;
    }

    get Sender(){
        return this.command.Sender;
    }

    get Duration(){
        return this._duration;
    }

    get DurationAsString(){
        let date = new Date(0);
        let remaningSeconds = this._duration;
        date.setHours(remaningSeconds/3600);
        remaningSeconds -= date.getHours() * 3600;
        date.setMinutes(remaningSeconds/60);
        remaningSeconds -= date.getMinutes() * 60;
        date.setSeconds(remaningSeconds);
        let timeString = date.toISOString().substr(11, 8);
        return timeString;
    }

    get TargetTextChannel(){
        return this.command?.SenderChannel
    }

    get Thumbnail(){
        return this.thumbnail;
    }

    get Stream(){
       return this.provider.GetStreamForUri(this.Uri);
    }

    private SanitizeDateString(duration: String){
        let splitResult = duration.split(":");
        let hours = "00";
        let minutes;
        let seconds;
        if(splitResult.length > 2){
            hours = splitResult[0].padStart(2, '0');
            splitResult.splice(0,1);
        }
        minutes = splitResult[0].padStart(2, '0');
        seconds = splitResult[1].padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    private ParseDateStringToSeconds(duration: String){
        let sanitizedDuration = this.SanitizeDateString(duration);
        let date = new Date(`1970-01-01T${sanitizedDuration}Z`);
        let totalSeconds = 0;
        totalSeconds += date.getSeconds();
        totalSeconds += date.getMinutes() * 60;
        totalSeconds += date.getHours() * 3600;
        return totalSeconds;
    }
}