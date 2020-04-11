import { Command } from "./Command";
import { Song } from "./Song";
import { VoiceChannel } from "discord.js";
const ytdl = require('ytdl-core');

export class Instance{

    private _playlist : Array<Song> = [];
    private _isPlaying : boolean = false;
    private _connection : any = null; //to change for connection
    constructor(private voiceChannel : VoiceChannel) {
    

    }

    get IsPlaying() {
        return this._isPlaying;
    }

    AddSong(song : Song){
        this._playlist.push(song);
        if(!this._isPlaying){
            this.Play();
        }
    }

    private async Play(){
        
        if(this._connection === null){
           this._connection = await this.voiceChannel.join();
        }

        if(this._playlist.length > 0){
            let song = this._playlist.shift();
            this._isPlaying = true;
    
            let dlOptions = {quality: "highestaudio", filter: "audioonly"};
            let streamOptions = {bitrate: 256000, volume: 0.08, highWaterMark:1};
            const stream = ytdl(song.Url, dlOptions);
            const dispatcher = this._connection.play(stream, streamOptions)
            .on('error', (error : any) => {
                console.error(error);
            })
            .on('end', () => { 
                console.log('Music ended');
                this.Play();
            });
        }else{
            this._isPlaying = false;
            this.Close();
        }
    }

    private Close(){
        this.voiceChannel.leave();
        this._connection = null;
    }
}