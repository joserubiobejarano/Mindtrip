const WIKIMEDIA_SPECIAL_FILE_PATH = "https://commons.wikimedia.org/wiki/Special:FilePath/";

export const normalizeWikimediaSrc = (src: string) => {
  const trimmed = src.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith(WIKIMEDIA_SPECIAL_FILE_PATH)) {
    const rawFile = trimmed.slice(WIKIMEDIA_SPECIAL_FILE_PATH.length);
    const decodedFile = decodeURIComponent(rawFile);
    const encodedFile = encodeURIComponent(decodedFile);
    return `/api/wikimedia?file=${encodedFile}`;
  }

  return trimmed;
};
