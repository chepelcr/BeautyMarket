/**
 * Downloads a file from a URL or blob
 */
export async function downloadFile(url: string, fileName: string, extension: string = "pdf") {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `${fileName}.${extension}`;
    anchor.click();
    
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

/**
 * Downloads a blob directly
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = fileName;
  anchor.click();
  
  window.URL.revokeObjectURL(downloadUrl);
}