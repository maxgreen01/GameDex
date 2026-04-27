// holds all the types needed for typescript
// types/game.ts

export interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface CarouselCardData {
  id: string;
  background_image?: string;
  name: string;
  rating: number;
  platforms?: Platform[];
}
