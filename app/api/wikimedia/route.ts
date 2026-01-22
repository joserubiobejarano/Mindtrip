const WIKIMEDIA_SPECIAL_FILE_PATH = "https://commons.wikimedia.org/wiki/Special:FilePath/";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileParam = searchParams.get("file");

  if (!fileParam) {
    return new Response("Missing file parameter.", { status: 400 });
  }

  const decodedFile = decodeURIComponent(fileParam);
  const encodedFile = encodeURIComponent(decodedFile);
  const upstreamUrl = `${WIKIMEDIA_SPECIAL_FILE_PATH}${encodedFile}`;

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; MindTrip/1.0)",
        accept: "image/*,*/*;q=0.8",
      },
    });
  } catch (error) {
    return new Response("Failed to reach Wikimedia.", { status: 502 });
  }

  if (!upstreamResponse.ok) {
    const errorBody = await upstreamResponse.text();
    return new Response(errorBody || "Failed to fetch image.", {
      status: upstreamResponse.status,
    });
  }

  if (!upstreamResponse.body) {
    return new Response("No image content returned.", { status: 502 });
  }

  const contentType = upstreamResponse.headers.get("content-type") ?? "application/octet-stream";
  const cacheControl =
    upstreamResponse.headers.get("cache-control") ?? "public, max-age=86400";

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: {
      "content-type": contentType,
      "cache-control": cacheControl,
    },
  });
}
