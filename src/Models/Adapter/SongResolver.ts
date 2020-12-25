import { ISongResolver } from "./ISongResolver";
import { Song } from "../Song";
import { SpotifySongResolver } from "./SpotifySongResolver";
import { YoutubeSongResolver } from "./YoutubeLinkSongResolver";
import { YoutubeSearchSongResolver } from "./YoutubeSearchSongResolver";
import { YoutubeSearchSongResolverTwo } from "./YoutubeSearchSongResolverTwo";

import { Command } from "../Command";

export class SongResolver implements ISongResolver{

    private readonly _resolvers : Array<ISongResolver> = new Array<ISongResolver>();

    constructor(){
        this._resolvers.push(new YoutubeSongResolver());
        this._resolvers.push(new SpotifySongResolver());
        this._resolvers.push(new YoutubeSearchSongResolver());
        //this._resolvers.push(new YoutubeSearchSongResolverTwo());
    }

    /*
    Tries all services to find songs
    [IN] uri : a query (playlist or song)
    [IN] command
    [OUT] A promise containing an array of Songs
    */
    async ResolveUri(uri: String, command: Command): Promise<Song[]>{
        let result = new Array<Song>();
        for(let i in this._resolvers){
            let resolver = this._resolvers[i];
            result = await resolver.ResolveUri(uri, command);
            if(result.length > 0){
                break;
            }
        }
        return result;
    }    
}