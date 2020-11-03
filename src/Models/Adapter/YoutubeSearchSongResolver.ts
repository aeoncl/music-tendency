import { ISongResolver } from "./ISongResolver";
import { Song } from "../Song";
import { Command } from "../Command";
import { YoutubeFileStreamProvider } from "../Providers/YoutubeFileStreamProvider";
const ytsr = require('ytsr');

export class YoutubeSearchSongResolver implements ISongResolver{

    /*
        Search youtube with query and find song
        [IN] uri
        [IN] Command
        [OUT] Songs
    */
    async ResolveUri(uri: String, command: Command): Promise<Song[]>{
        let songList : Song[] = new Array<Song>();
        let results : any = await YoutubeSearchSongResolver.searchYoutube(uri);
        //Duration format: h:mm:ss
        //type: movie, video

        for(let i in results.items){
            let current : {type: string, link: string, title: string, duration: string, thumbnail: string} = results.items[i];
            if(current.type === "video"){
                songList.push(new Song(current.link, current.title, current.duration, command, current.thumbnail, new YoutubeFileStreamProvider()));
                break;
            }
        }
        return songList;
    }
    
    static searchYoutube(uri: String){
        let searchPromise = new Promise((resolve, reject) => {
            ytsr(uri, {limit:5, safeSearch: false}, (err: Error, searchResults: any) => {
                if(err){
                    reject(err);
                }
                resolve(searchResults);
            });
        });
        return searchPromise;
    }

}