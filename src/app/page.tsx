import Hero from "@/components/Hero";
import GalleryClient from "@/components/GalleryClient";
import { getPhotosFromDrive } from "@/lib/drive";
import { generateDailyStory } from "@/lib/gemini";
import { Photo } from "@/types/photo";
export const revalidate = 1801;

export default async function Home() {
  // 1. Fetch images from Google Drive dynamically
  const photosData: Photo[] = await getPhotosFromDrive();

  // 2. Pick a daily featured photo for the AI Story
  let featuredPhoto: Photo | null = null;
  let dailyStory = "";

  const galleryPhotos = photosData.filter(p => p.curation?.category?.trim().toLowerCase() !== "author");
  
  if (galleryPhotos.length > 0) {
    // Deterministic random selection based on current date, restricted to 'Best' category
    const bestPhotos = galleryPhotos.filter(p => p.curation?.category?.toLowerCase() === 'best');
    const sourcePhotos = bestPhotos.length > 0 ? bestPhotos : galleryPhotos;
    
    const now = new Date();
    // Create a unique seed for every 30-minute block of the current day
    const halfHourBlock = Math.floor(now.getMinutes() / 30);
    const seed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours() * 10 + halfHourBlock;
    const randomIndex = seed % sourcePhotos.length;
    
    featuredPhoto = sourcePhotos[randomIndex];
    
    // 3. Generate the AI story using exactly 1 API call per 30 mins
    dailyStory = await generateDailyStory(
      featuredPhoto.curation?.title || "A beautiful moment",
      featuredPhoto.curation?.category || "Cinematic Photography"
    );
  }

  return (
    <>
      {/* Preload handled by Next.js priority Image in Hero */}
      <Hero featuredPhoto={featuredPhoto} dailyStory={dailyStory} />
      <GalleryClient photosData={photosData} />
    </>
  );
}
