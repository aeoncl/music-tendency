import { ISongResolver } from "./ISongResolver";
import { Song } from "../Song";
import { NoMusicFound } from "../../Exceptions/NoMusicFoundError";
import { YoutubeFileStreamProvider } from "../Providers/YoutubeFileStreamProvider";
import { Command } from "../Command";
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

export class YoutubeSongResolver implements ISongResolver{

    /*
    Parse youtube link and retreive songs
    [IN] URI
    [IN] Command
    [OUT] Promise<Song[]>
    */
    async ResolveUri(uri: String, command: Command): Promise<Song[]>{
        let songList : Song[] = new Array<Song>();
        //let isPlaylist : boolean =  ytpl.validateId(ytpl.getPlaylistId(uri)); //Disabled Playlist
        if(uri.includes("list")){
            throw new Error("Playlists are temporary disabled, sorry. Our Minions are working to fix the issue.")
        }
        let isPlaylist = false;
        if(isPlaylist){
         let playlistId = uri?.match(/(.+list=)([^&]+)/)[2];
         const playlistInfo = await ytpl(playlistId);
            const playlistItems = playlistInfo['items'];

            for(let playlistItemId in playlistItems){

                let item : { title: String; url_simple: String; duration:String; thumbnail: String } = playlistItems[playlistItemId];
                let song = new Song(item.url_simple,item.title,item.duration as string,command, item.thumbnail , new YoutubeFileStreamProvider());
                songList.push(song);
            }

        }else{
            let urlIsValid = ytdl.validateURL(uri);
            if(urlIsValid){
                const songInfo = await ytdl.getInfo(uri);
                let song = new Song(songInfo.videoDetails.video_url,songInfo.videoDetails.title,parseInt(songInfo.videoDetails.lengthSeconds), command, songInfo.videoDetails.thumbnail.thumbnails[0].url, new YoutubeFileStreamProvider());
                songList.push(song);
            }
        }
        return songList;
    }

}