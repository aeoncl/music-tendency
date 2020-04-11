export class Song{

    constructor(readonly title : String, readonly url : String, readonly sender: String){

    }

    get Title(){
        return this.title;
    }

    get Url(){
        return this.url;
    }

    get Sender(){
        return this.sender;
    }
}