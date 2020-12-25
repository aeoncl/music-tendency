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
            let current : {type: string, url: string, title: string, duration: string, thumbnails: any[]} = results.items[i];
            if(current.type === "video"){
                songList.push(new Song(current.url, current.title, current.duration, command, current.thumbnails[0].url, new YoutubeFileStreamProvider()));
                break;
            }
        }
        return songList;
    }
    
    static searchYoutube(uri: String){
            return ytsr(uri, {limit:5, safeSearch: false});
    }

}