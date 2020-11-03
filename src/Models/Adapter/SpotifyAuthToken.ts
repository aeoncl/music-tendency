import { access } from "fs";

export class SpotifyAuthToken{

    private _accessToken : String;
    private _tokenType: String;
    //Seconds
    private _expiresIn: number;
    private _scope: String;
    private _creationTime : number;
    private readonly THRESHOLD = 300;

    constructor(tokenObject: {access_token: String, token_type: String, expires_in: String, scope: String}){
        this._accessToken = tokenObject.access_token;
        this._tokenType = tokenObject.token_type;
        this._expiresIn = Number.parseInt(tokenObject.expires_in as string);
        this._scope = tokenObject.scope;
        this._creationTime = Date.now();
    }

    ExpiresSoon() : boolean{
        return (this._creationTime + (this._expiresIn-this.THRESHOLD)*1000 > Date.now()) ? false : true;
    }

    get Token(){
        return this._accessToken;
    }
}