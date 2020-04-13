import { Song } from "./Song";
import { VoiceChannel, StreamOptions } from "discord.js";
import {EventEmitter} from 'events';
import { NoSongToSkipException } from "../Exceptions/NoSongToSkipException";
import { NoSongToClearException } from "../Exceptions/NoSongToClearException";
import { MusicFileStreamProvider } from "./Providers/MusicFileStreamProvider";

export class Instance extends EventEmitter{

    private _playlist : Array<Song> = [];
    private _isPlaying : boolean = false;
    private _connection : any = null; //to change for connection
    private _destructionTimer : any = null;
    constructor() {
        super();
        this.SetupAutodestruction();
    }

    get IsPlaying() {
        return this._isPlaying;
    }

    get Queue(){
        return this._playlist;
    }

    async AddSong(song : Song){
        this._playlist.push(song);
        if(!this._isPlaying){
            await this.PlayQueue();
        }
        return;
    }

    async JoinVocal(voiceChannel : VoiceChannel){
        if(this._connection === null){
            this._connection = await voiceChannel.join();
         }
    }

    private async PlayQueue(){
        if(this._playlist.length > 0){

            this.AbortAutodestruction();

            let song = this._playlist.shift();
            this._isPlaying = true;
            let streamOptions = {bitrate: 256000, volume: 0.4};

            this.PlaySound(song, streamOptions).then(() => {
                console.log('Music ended');
                this.PlayQueue();
            });
        }else{
            this._isPlaying = false;
            this.SetupAutodestruction();
        }

        return;
    }

    private AbortAutodestruction(){
        if(this._destructionTimer !== null){
            clearTimeout(this._destructionTimer);
            this._destructionTimer = null;
            console.log("Timer abort");
        }
    }
    private SetupAutodestruction(){
        if(this._destructionTimer !== null){
            this._destructionTimer.refresh();
        }else{
            this._destructionTimer = setTimeout(() => this.Close(), 900000);
        }
        console.log("Autodestruct timer setup");
    }

    Skip() : boolean{
        if(this._playlist.length === 0){
            throw new NoSongToSkipException();
        }
        this._connection?.dispatcher?.end();
        return true;
    }

    Clear() : boolean{
        if(this._playlist.length === 0){
            throw new NoSongToClearException();
        }
        this._playlist.splice(0,this._playlist.length);
        return true
    }

    Stop() {
        this._playlist.splice(0,this._playlist.length);
        this._connection?.dispatcher?.end();
        this.SetupAutodestruction();
    }

    Close(){
            this.PlayLeavingSound().finally(() => {
                let voiceChannelId = this._connection?.channel?.id;
                this._connection?.channel?.leave();
                this._connection = null;
                this.emit("closure", voiceChannelId);
            });
    }

    private PlayLeavingSound(){
        let randomId = this.getRandomInt(4);
        console.log(`randomNumber: ${randomId}`);
        return this.PlaySound(new Song("seeya", `././sounds/seeya${randomId}.ogg`, "nothing", new MusicFileStreamProvider()), { volume: 0.5});
    }

    private getRandomInt(max : number) {
        return Math.floor(Math.random() * Math.floor(max));
      }

    private PlaySound(song: Song, streamOptions: StreamOptions) {
        let playPromise = new Promise((resolve, reject) => {
            if(this._connection === null){
                reject();
            }else{
                const stream = song.GetStream();
                this._connection?.play(stream, streamOptions)
                .on('error', (error : any) => {
                        console.error(error);
                        reject();
                    })
                    .on('speaking', (value : boolean) => { 
                        if(!value){
                            resolve();
                        }
                    });   
            }
        });
        return playPromise;
        }
}