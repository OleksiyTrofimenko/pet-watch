import { ApiError, NETWORK_ERROR } from './api-client';

/**
 * PUT a local file to a presigned URL. XMLHttpRequest, not fetch: only XHR reports upload
 * progress in React Native. `contentType` must match the one the URL was signed with.
 */
export async function uploadFile(
  url: string,
  fileUri: string,
  contentType: string,
  onProgress: (fraction: number) => void,
): Promise<void> {
  const file = await (await fetch(fileUri)).blob();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(
            new ApiError(xhr.status, 'UPLOAD_FAILED', "The photo couldn't be uploaded. Try again."),
          );
    xhr.onerror = () =>
      reject(
        new ApiError(0, NETWORK_ERROR, "You're offline. Check your connection and try again."),
      );
    xhr.send(file);
  });
}
