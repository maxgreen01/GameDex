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
  gameImg?: string;
  gameName: string;
  rating: number;
  platforms?: Platform[];
}