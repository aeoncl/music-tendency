import { IMusicStreamProvider } from "./Providers/IMusicStreamProvider";

export class Song{

    constructor(readonly title : String, readonly uri : String, readonly sender: String, readonly provider:IMusicStreamProvider){

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

    public GetStream(){
       return this.provider.GetStreamForUri(this.Uri);
    }
}