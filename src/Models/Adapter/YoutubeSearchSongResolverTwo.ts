import { ISongResolver } from "./ISongResolver";
import { Song } from "../Song";
import { Command } from "../Command";
import { YoutubeFileStreamProvider } from "../Providers/YoutubeFileStreamProvider";
import {search, YoutubeVideo} from "./AlternateYoutubeSearchAdapter";


export class YoutubeSearchSongResolverTwo implements ISongResolver {

    async ResolveUri(uri: String, command: Command): Promise<Song[]> {
        let songs : Song[] = new Array<Song>();
        let results : YoutubeVideo[] = await search(uri as string);

        results.forEach(result => {
            songs.push(new Song("https://www.youtube.com/watch?v="+result.id, result.title, 0, command, "https://placehold.it/780x480&text=No+Thumbnail+available", new YoutubeFileStreamProvider()));
            return;
        });
        let out : Song[] = new Array<Song>();
        if(results.length > 0){
            out.push(songs[0]);
        }
        return out;
    }

}
