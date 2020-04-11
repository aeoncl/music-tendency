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
            let streamOptions = {bitrate: 256000};
    
            const dispatcher = this._connection.playStream(ytdl(song.Url, dlOptions), streamOptions)
            .on('error', (error : any) => {
                console.error(error);
            })
            .on('end', () => { 
                console.log('Music ended');
                this.Play();
            });
        }else{
            this._isPlaying = false;
        }
    }
}