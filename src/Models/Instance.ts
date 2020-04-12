import { Command } from "./Command";
import { Song } from "./Song";
import { VoiceChannel } from "discord.js";
import { MessageSenderHelper } from "./MessageSenderHelper";
import {EventEmitter} from 'events';
import util, { inherits } from 'util';
import { stringify } from "querystring";
import { NoSongToSkipException } from "../Exceptions/NoSongToSkipException";
import { NoSongToClearException } from "../Exceptions/NoSongToClearException";
import {promisify} from "util";
import fs from "fs";
import { resolve } from "dns";
import { rejects } from "assert";

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

        if(this._destructionTimer !== null){
            clearTimeout(this._destructionTimer);
            console.log("Timer abort");
        }

        if(this._playlist.length > 0){

            if(this._connection === null){
                this._connection = await this.voiceChannel.join();
             }

            let song = this._playlist.shift();
            this._isPlaying = true;
            let dlOptions = {quality: "highestaudio", filter: "audioonly"};
            let streamOptions = {bitrate: 256000, volume: 0.1, highWaterMark:4};
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
        console.log("Autodestruct timer setup");
        this._destructionTimer = setTimeout(() => this.Close(), 900000);
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
        this.SetupAutodesctruction();
    }

    Close(){
            this.PlayLeavingSound().then(() => {
                this.voiceChannel?.leave();
                this._connection = null;
                this.emit("closure", this.voiceChannel.id);
            });
    }

    private PlayLeavingSound() {

        let playPromise = new Promise((resolve, reject) => {
            if(this._connection === null){
                resolve();
            }else{
                this._connection.play('././sounds/seeya.mp3', { volume: 1 })
                .on('error', (error : any) => {
                        console.error(error);
                        resolve();
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