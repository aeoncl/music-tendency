export interface IMusicStreamProvider{
    GetStreamForUri(uri: String) : ReadableStream;
}