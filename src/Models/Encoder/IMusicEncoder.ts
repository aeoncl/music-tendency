import { Readable } from "stream";

export interface IMusicEncoder{
    encode(stream: Readable) : Readable;
}