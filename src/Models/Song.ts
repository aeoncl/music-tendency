import { IMusicStreamProvider } from "./Providers/IMusicStreamProvider";
import { MusicFileStreamProvider } from "./Providers/MusicFileStreamProvider";

export class Song{

    constructor(readonly uri : String, readonly title?: String, readonly duration?: String, readonly sender?: String, readonly provider:IMusicStreamProvider = new MusicFileStreamProvider()){

    }

    get Title(){
        return this.title;
    }

    get Uri(){
        return this.uri;
    }

    get Sender(){
        return this.sender;
    }

    get Duration(){
        return this.duration;
    }

    public GetStream(){
       return this.provider.GetStreamForUri(this.Uri);
    }
}