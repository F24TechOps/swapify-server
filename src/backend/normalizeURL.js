export function normalizeUrl(url) {
  if (!url || url[0] === '/' || !url.startsWith('https')) return url;
  let urlObj = new URL(url);
  return urlObj.pathname;
}
