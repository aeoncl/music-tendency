import querystring from 'querystring';
import fetch from 'node-fetch';

export interface YoutubeVideo {
  id: string;
  title: string;
  author: string;
  authorId: string;
}

function extractWindowYtInitialData(html: string) {
  const json = /window\["ytInitialData"\] = (.*);/gm.exec(html);
  return json ? json[1] : null;
}

function extractYtInitialData(html: string) {
  const json = /var ytInitialData = (.*);/gm.exec(html);
  return json ? json[1] : null;
}

function extractSearchResults(result: string) {
  let json: string | null = null;
  if (result.includes('window["ytInitialData"]')) json = extractWindowYtInitialData(result);
  else if (result.includes('var ytInitialData =')) json = extractYtInitialData(result);
  else return [];

  if (!json) return [];

  const obj = JSON.parse(json);

  // eslint-disable-next-line max-len
  const videoInfo = obj.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0]
    .itemSectionRenderer.contents;
  const ytVideos = videoInfo
    .filter((x: any) => x.videoRenderer)
    .map(({ videoRenderer }: any) => ({
      id: videoRenderer.videoId,
      title: videoRenderer.title.runs[0].text,
      author: videoRenderer.ownerText.runs[0].text,
      authorId: videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
    }));

  return ytVideos as YoutubeVideo[];
}

export async function search(query: string) {
  const res = await fetch(
    `https://www.youtube.com/results?${querystring.stringify({ search_query: query })}`,
    {
      headers: {
        'user-agent': ' Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        accept: 'text/html',
        'accept-encoding': 'gzip',
        'accept-language': 'en-US',
      },
    },
  );

  const text = await res.text();

  return extractSearchResults(text);
}