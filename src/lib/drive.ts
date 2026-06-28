import { env } from 'process';

export async function getPhotosFromDrive() {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || env.GOOGLE_API_KEY;
  const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || env.GOOGLE_DRIVE_FOLDER_ID;

  if (!GOOGLE_API_KEY || !GOOGLE_DRIVE_FOLDER_ID) {
    console.error("Missing Google Drive API keys in environment");
    return [];
  }

  // 1. Get folders
  const foldersUrl = `https://www.googleapis.com/drive/v3/files?q='${GOOGLE_DRIVE_FOLDER_ID}'+in+parents+and+trashed=false+and+mimeType='application/vnd.google-apps.folder'&fields=files(id,name)&key=${GOOGLE_API_KEY}&cb=2`;
  const foldersRes = await fetch(foldersUrl, { next: { revalidate: 3600 } });
  
  if (!foldersRes.ok) {
    console.error("Failed to fetch folders");
    return [];
  }
  const foldersData = await foldersRes.json();
  const folders = foldersData.files || [];

  // 2. Fetch images from each subfolder concurrently
  const folderPromises = folders.map(async (folder: any) => {
    const subUrl = `https://www.googleapis.com/drive/v3/files?q='${folder.id}'+in+parents+and+trashed=false+and+mimeType+contains+'image/'&fields=files(id,name,mimeType,createdTime,size,webContentLink,imageMediaMetadata,thumbnailLink)&key=${GOOGLE_API_KEY}&cb=3`;
    const subRes = await fetch(subUrl, { next: { revalidate: 3600 } });
    if (!subRes.ok) return [];
    
    const subData = await subRes.json();
    return (subData.files || []).map((img: any) => ({ ...img, folderCategory: folder.name }));
  });

  const arraysOfImages = await Promise.all(folderPromises);
  const allImages = arraysOfImages.flat();

  // 3. Map into expected data format
  return allImages.map(file => {
    const curation = {
      selected: true,
      title: file.name.split('.')[0].replace(/[-_]/g, ' '),
      caption: `A moment captured in ${file.folderCategory}.`,
      mood: "cinematic",
      category: file.folderCategory
    };

    let width = file.imageMediaMetadata?.width;
    let height = file.imageMediaMetadata?.height;

    if (!width || !height) {
      if (curation.category.toLowerCase() === 'portrait') {
        width = 800;
        height = 1000;
      } else {
        width = 1200;
        height = 800;
      }
    }

    return {
      id: file.id,
      name: file.name,
      exif: {}, // Skipping heavy EXIF parsing to keep Vercel function blazing fast (<2s)
      curation,
      webContentLink: file.webContentLink,
      thumbnailUrl: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+$/, '=s1000') : undefined,
      width,
      height
    };
  });
}
