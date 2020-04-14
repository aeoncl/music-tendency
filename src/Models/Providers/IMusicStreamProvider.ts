import { Readable } from "stream";

export interface IMusicStreamProvider{
    GetStreamForUri(uri: String) : Readable;
}