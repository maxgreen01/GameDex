export type WithId<T> = T & { _id: string };

export type User = {
  username: string;
  email: string;
  displayName: string;
  description: string;
  friends: string[];
  incomingRequests: string[];
  outgoingRequests: string[];
  reviews: string[];
  privateProfile: boolean;
  createdAt: number;
};

export type SignupData = {
  username: string;
  email: string;
  displayName: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type ProfileData = {
  displayName: string;
  username: string;
  description: string;
  privateProfile: boolean;
};

export type Platform = {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
};

export type Game = {
  id: number;
  slug: string;
  name: string;
  background_image: string;
  platforms: Platform[];
  rating: number;
  description: string;
  genres: string[];
};

export type Collection = {
  name: string;
  userId: string;
  gameIds: string[];
  createdAt: number;
  updatedAt?: number;
};

export type CollectionCreationData = {
  name: string;
};

export type CollectionUpdateData = {
  name?: string;
  gameIdsToAdd?: string[];
  gameIdsToRemove?: string[];
};
