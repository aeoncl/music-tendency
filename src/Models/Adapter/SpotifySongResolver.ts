import { ISongResolver } from "./ISongResolver";
import { Song } from "../Song";
import { Command } from "../Command"
import https, { RequestOptions } from 'https';
import "../../Env/env";
import { SpotifyAuthToken } from "./SpotifyAuthToken";
import { YoutubeSearchSongResolver } from "./YoutubeSearchSongResolver";
import { MessageSenderHelper } from "../MessageSenderHelper";
import { TextChannel } from "discord.js";

var querystring = require('querystring');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const key = process.env.SPOTIFY_KEY;

export class SpotifySongResolver extends YoutubeSearchSongResolver implements ISongResolver{
    private readonly _spottiApi: any;
    private _accessToken: SpotifyAuthToken = null;
    private readonly _regex = new RegExp(/(?:https:\/\/)?(?:open)?\.?(?:spotify)(?:.com)?\/?:?(album|track|playlist)\/?:?(\w+)/gm);

    constructor(){
        super();
    }

    async ResolveUri(uri: String, command: Command): Promise<Song[]>{

        if(this._accessToken === null || this._accessToken?.ExpiresSoon()){
            this._accessToken = await this.GetAccessTokenAsync();
        }

        let songList = new Array<Song>();
        let matches = this.getMatches(uri);
        if(matches !== null){
            let response;
            MessageSenderHelper.WriteSpotify(command.SenderChannel as TextChannel);
            switch(matches[1]){
                case "track":
                     response = await this.GetTrack(matches[2]).catch((err : Error) => console.log(err.message));
                     songList = await this.ResolveYoutubeTrack(response as any, command);
                    break;
                case "album":
                    response = await this.GetAlbumTracks(matches[2]).catch((err : Error) => console.log(err.message));
                    songList = await this.ResolveYoutubeAlbum(response as any, command);
                    break;
                case "playlist":
                    response = await this.GetPlaylistTracks(matches[2]).catch((err : Error) => console.log(err.message));
                    songList = await this.ResolveYoutubePlaylist(response as any, command);
                    break;
            }
        }
        return songList;
    }

    private async ResolveYoutubePlaylist(response: {items: []}, command: Command) {
        let songList = new Array<Song>();

        for(let i in response.items){
            let elem : {track : {artists: Array<{name: String}>, name: String}} = response.items[i];
            let current = await this.ResolveYoutubeTrack(elem.track, command);
            if(current.length > 0){
              songList.push(current[0]);
            }
        }

        return songList;
    }

    private async ResolveYoutubeAlbum(response: {items: []}, command: Command) {
        let songList = new Array<Song>();
        for(let i in response.items){
            let elem : {artists: Array<{name: String}>, name: String} = response.items[i];
            let current = await this.ResolveYoutubeTrack(elem, command);
            if(current.length > 0){
              songList.push(current[0]);
            }
        }
          return songList;
    }

    private ResolveYoutubeTrack(response: {artists: Array<{name: String}>, name: String}, command: Command) : Promise<Array<Song>> {
        let artistName = response.artists[0].name;
        let songName = response.name;
        return super.ResolveUri(`${artistName} ${songName}`, command);
    }

    GetTrack(trackId: string) {
        const options = {
            hostname: 'api.spotify.com',
            port: 443,
            path: `/v1/tracks/${trackId}`,
            method: 'get',
            headers: {
                'Authorization': `Bearer ${this._accessToken.Token}`
            },
        }
        return this.SendGetRequest(options as any);
    }

    GetPlaylistTracks(playlistId: string) {
        const options = {
            hostname: 'api.spotify.com',
            port: 443,
            path: `/v1/playlists/${playlistId}/tracks`,
            method: 'get',
            headers: {
                'Authorization': `Bearer ${this._accessToken.Token}`
            },
        }
        return this.SendGetRequest(options as any);
    }

    GetAlbumTracks(albumId: string) {
        const options = {
            hostname: 'api.spotify.com',
            port: 443,
            path: `/v1/albums/${albumId}/tracks`,
            method: 'get',
            headers: {
                'Authorization': `Bearer ${this._accessToken.Token}`
            },
        }
        return this.SendGetRequest(options as any);
    }

    private getMatches(str : String){
        try{
            return str.match(new RegExp(this._regex.source, this._regex.flags))
            .map(match => 
                new RegExp(this._regex.source, this._regex.flags)
                .exec(match))[0];
                
        }catch(e){
            return null;
        }
    }

    private SendGetRequest(options: RequestOptions){
        let requestPromise = new Promise<String>((resolve, reject) => {
            
            const req = https.get(options as any, (res) => {
                let response = '';
                res.on("data", (chunk) => {
                    response += chunk;
                });
                
                res.on('end', () => {
                    resolve(JSON.parse(response));
                  });

                res.on('error', (err) => {
                    console.log(`statusCode: ${res.statusCode}`);
                    console.log(err);
                    reject(err);
                })

            });
        });
        return requestPromise;
    }

    private GetAccessTokenAsync(){
        let promiseTest = new Promise<SpotifyAuthToken>((resolve, reject) => {
            const postData : string = querystring.stringify({
                grant_type: "client_credentials"
            });
    
            const options = {
                hostname: 'accounts.spotify.com',
                port: 443,
                path: '/api/token',
                method: 'post',
                headers: {
                    'Content-Type' : 'application/x-www-form-urlencoded',
                    'Content-Length': postData.length,
                    'Authorization': `Basic ${Buffer.from(`${clientId}:${key}`).toString('base64')}`,
                },
            }
    
            const req = https.request(options, (res) => {
                let response = '';
                res.on('data', chunk => {
                    response += chunk;
                })
                res.on('end', () => {
                    resolve(new SpotifyAuthToken(JSON.parse(response)));
                  });
                res.on('error', (err) => {
                    console.log(`statusCode: ${res.statusCode}`);
                    console.log(err);
                    reject(err);
                })
              })
              
              req.on('error', error => {
                console.error(error)
                reject(error);
              })
              
              req.write(postData);
              req.end();
        });
        return promiseTest;
    }
}