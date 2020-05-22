import { Song } from "../Song";
import { Command } from "../Command";

export interface ISongResolver{
    

    ResolveUri(uri: String, command : Command) : Promise<Song[]>;

}