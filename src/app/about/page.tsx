import { Metadata } from "next";
import { Camera } from "lucide-react";
import { getPhotosFromDrive } from "@/lib/drive";
import { Photo } from "@/types/photo";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About | Jay Gurav",
  description: "Learn more about Jay Gurav, Photographer.",
};

export const revalidate = 86400; // 24 hours caching

export default async function About() {
  const photosData: Photo[] = await getPhotosFromDrive();
  const authorPhoto = photosData.find(p => p.curation?.category?.trim().toLowerCase() === "author");
  
  const imageUrl = authorPhoto 
    ? `https://drive.google.com/thumbnail?id=${authorPhoto.id}&sz=w1000`
    : null;

  return (
    <div className="min-h-screen bg-background pt-32 pb-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-5xl font-serif font-bold text-white mb-4 tracking-tighter">Jay Gurav</h1>
              <p className="text-accent uppercase tracking-widest text-sm font-semibold mb-6">Photographer</p>
              
              <div className="space-y-6 text-gray-300 font-light leading-relaxed text-lg">
                <p>
                  I explore the world through the creative vision of a photographer. My work is driven by a deep curiosity about how human stories unfold in everyday moments.
                </p>
                <p>
                  Whether I am exploring a bustling street or waiting for the perfect light to capture a fleeting landscape, my approach remains the same: acute observation, patience, and a relentless pursuit of the truth.
                </p>
                <p>
                  This portfolio is a curated collection of my visual journeys. Each photograph is more than an image; it is a narrative suspended in time, reflecting my cinematic and minimalist aesthetic.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 pt-8 border-t border-white/10">
              <div className="p-6 bg-card rounded-2xl border border-white/5 hover:border-white/20 transition-colors">
                <Camera className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-white font-serif text-xl mb-2">Photography</h3>
                <p className="text-gray-400 text-sm font-light">Cinematic narratives, street explorations, and timeless portraits.</p>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/3 aspect-[3/4] rounded-2xl bg-card overflow-hidden border border-white/10 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-end p-6">
              <p className="text-white/80 font-serif italic">"Finding the unseen in the seen."</p>
            </div>
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt="Jay Gurav" 
                fill 
                className="object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-pointer" 
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-[#333]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
