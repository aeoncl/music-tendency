import { Command } from "./Command";
import { Song } from "./Song";
import { VoiceChannel } from "discord.js";
import { MessageSenderHelper } from "./MessageSenderHelper";
import {EventEmitter} from 'events';
import util, { inherits } from 'util';
import { stringify } from "querystring";
import { NoSongToSkipException } from "../Exceptions/NoSongToSkipException";
import { NoSongToClearException } from "../Exceptions/NoSongToClearException";

const ytdl = require('ytdl-core');

export class Instance extends EventEmitter{

    private _playlist : Array<Song> = [];
    private _isPlaying : boolean = false;
    private _connection : any = null; //to change for connection
    private _destructionTimer : any = null;
    constructor(private voiceChannel : VoiceChannel) {
        super();
        this.SetupAutodesctruction();
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
            await this.Play();
        }
        return;
    }

    private async Play(){
        
        if(this._connection === null){
           this._connection = await this.voiceChannel.join();
        }

        if(this._destructionTimer !== null){
            clearTimeout(this._destructionTimer);
        }
        
        if(this._playlist.length > 0){
            let song = this._playlist.shift();
            this._isPlaying = true;
            let dlOptions = {quality: "highestaudio", filter: "audioonly"};
            let streamOptions = {bitrate: 256000, volume: 0.1, highWaterMark:1};
            const stream = ytdl(song.Url, dlOptions);
            const dispatcher = this._connection.play(stream, streamOptions)
            .on('error', (error : any) => {
                console.error(error);
            })
            .on('speaking', (value : boolean) => { 
                if(!value){
                    console.log('Music ended');
                    this.Play();
                }
            });
        }else{
            this._isPlaying = false;
            this.SetupAutodesctruction();
        }

        return;
    }


    private SetupAutodesctruction(){
        this._destructionTimer = setTimeout(() => this.Close(), 300000);
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
        this._connection?.dispatcher?.end();
        this._playlist.splice(0,this._playlist.length);
        this.SetupAutodesctruction();
    }


    private Close(){
        this.voiceChannel?.leave();
        this._connection = null;
        this.emit("closure", this.voiceChannel.id);
    }
}