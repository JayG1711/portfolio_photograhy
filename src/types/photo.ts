export interface PhotoExif {
  make?: string;
  model?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  date?: string;
}

export interface PhotoCuration {
  title?: string;
  caption?: string;
  category?: string;
  mood?: string;
  dominantColors?: string[];
}

export interface Photo {
  id: string;
  name?: string;
  exif?: PhotoExif;
  curation?: PhotoCuration;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}
