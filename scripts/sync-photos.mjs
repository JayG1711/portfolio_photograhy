import fs from 'fs/promises';
import path from 'path';
import exifr from 'exifr';
import dotenv from 'dotenv';

dotenv.config();

const { GOOGLE_API_KEY, GOOGLE_DRIVE_FOLDER_ID } = process.env;

if (!GOOGLE_API_KEY || !GOOGLE_DRIVE_FOLDER_ID) {
  console.error("Missing required environment variables in .env (GOOGLE_API_KEY, GOOGLE_DRIVE_FOLDER_ID)");
  process.exit(1);
}

const PHOTOS_DATA_PATH = path.join(process.cwd(), 'src', 'data', 'photos.json');

async function getDriveFiles(folderId) {
  // Get all folders inside this folder
  const foldersUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false+and+mimeType='application/vnd.google-apps.folder'&fields=files(id,name)&key=${GOOGLE_API_KEY}`;
  const foldersRes = await fetch(foldersUrl);
  const foldersData = await foldersRes.json();
  const folders = foldersData.files || [];

  // Get all images directly in this folder
  const imagesUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false+and+mimeType+contains+'image/'&fields=files(id,name,mimeType,createdTime,size,webContentLink)&key=${GOOGLE_API_KEY}`;
  const imagesRes = await fetch(imagesUrl);
  const imagesData = await imagesRes.json();
  const rootImages = (imagesData.files || []).map(img => ({ ...img, folderCategory: "Gallery" }));

  let allImages = [...rootImages];

  // Fetch images from each subfolder
  for (const folder of folders) {
    console.log(`Found category folder: ${folder.name}`);
    const subUrl = `https://www.googleapis.com/drive/v3/files?q='${folder.id}'+in+parents+and+trashed=false+and+mimeType+contains+'image/'&fields=files(id,name,mimeType,createdTime,size,webContentLink)&key=${GOOGLE_API_KEY}`;
    const subRes = await fetch(subUrl);
    const subData = await subRes.json();
    const subImages = (subData.files || []).map(img => ({ ...img, folderCategory: folder.name }));
    allImages = allImages.concat(subImages);
  }

  return allImages;
}

async function main() {
  console.log('Fetching categorized file list from Google Drive...');
  
  const driveFiles = await getDriveFiles(GOOGLE_DRIVE_FOLDER_ID);
  console.log(`Found ${driveFiles.length} image(s) total across all categories.`);

  // We are going to reset the photos.json because categories have changed based on folders
  const newCuratedPhotos = [];
  
  for (const file of driveFiles) {
    console.log(`\nProcessing file: ${file.name} (Category: ${file.folderCategory})`);
    
    try {
      // Small delay to prevent hitting Google Drive API rate limits
      await new Promise(r => setTimeout(r, 100));
      
      let imgRes = null;
      let buffer = null;
      
      const urlsToTry = [
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&acknowledgeAbuse=true&key=${GOOGLE_API_KEY}`,
        file.webContentLink,
        `https://drive.google.com/thumbnail?id=${file.id}&sz=w1600` // Ultimate fallback (always public)
      ];

      for (const url of urlsToTry) {
        if (!url) continue;
        try {
          const res = await fetch(url);
          if (res.ok) {
            imgRes = res;
            buffer = Buffer.from(await res.arrayBuffer());
            break;
          }
        } catch (e) {
          // Ignore fetch errors and try next URL
        }
      }

      if (!buffer) {
         console.error(`Failed to download ${file.name} after trying all endpoints.`);
         continue;
      }
      
      // Parse EXIF
      let exifData = {};
      try {
        const parsed = await exifr.parse(buffer, {
          tiff: true,
          exif: true,
          gps: true,
        });
        if (parsed) {
          exifData = {
            make: parsed.Make,
            model: parsed.Model,
            lens: parsed.LensModel,
            iso: parsed.ISO,
            aperture: parsed.FNumber ? `f/${parsed.FNumber}` : undefined,
            shutterSpeed: parsed.ExposureTime ? `1/${Math.round(1/parsed.ExposureTime)}` : undefined,
            focalLength: parsed.FocalLength ? `${parsed.FocalLength}mm` : undefined,
            date: parsed.DateTimeOriginal,
            latitude: parsed.latitude,
            longitude: parsed.longitude,
          };
        }
      } catch (exifErr) {
        // Silent catch for missing EXIF
      }
      
      // Generate automatic offline curation based on folder name
      const curation = {
        selected: true,
        title: file.name.split('.')[0].replace(/[-_]/g, ' '),
        caption: `A moment captured in ${file.folderCategory}.`,
        mood: "cinematic",
        dominantColors: ["#111111"],
        tags: [file.folderCategory.toLowerCase(), "photography"],
        category: file.folderCategory
      };

      newCuratedPhotos.push({
        id: file.id,
        name: file.name,
        exif: exifData,
        curation,
        webContentLink: file.webContentLink
      });

      console.log(`Successfully curated: ${curation.title}`);

    } catch (e) {
      console.error(`Error analyzing ${file.name}:`, e.message);
    }

    // Incrementally save to photos.json so the website updates in real-time
    await fs.writeFile(PHOTOS_DATA_PATH, JSON.stringify(newCuratedPhotos, null, 2));
  }

  console.log(`\nSync complete!`);
}

main().catch(console.error);
