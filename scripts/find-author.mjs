import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const PARENT_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

async function findAuthorFolder() {
  const q = `'${PARENT_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&key=${API_KEY}`;
  
  const res = await fetch(url);
  const data = await res.json();
  console.log('Folders in root:', data);

  // If there's an author folder, let's list its files
  const authorFolder = data.files?.find(f => f.name.toLowerCase() === 'author');
  if (authorFolder) {
    const q2 = `'${authorFolder.id}' in parents and trashed=false`;
    const url2 = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q2)}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&key=${API_KEY}`;
    const res2 = await fetch(url2);
    const data2 = await res2.json();
    console.log('Files in author folder:', data2);
  } else {
    // maybe it's just a file named author?
    const q3 = `'${PARENT_ID}' in parents and name contains 'author' and trashed=false`;
    const url3 = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q3)}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&key=${API_KEY}`;
    const res3 = await fetch(url3);
    const data3 = await res3.json();
    console.log('Files containing author in root:', data3);
  }
}

findAuthorFolder().catch(console.error);
