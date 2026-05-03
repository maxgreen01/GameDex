export type WithId<T> = T & { _id: string };

export type User = {
  username: string;
  email: string;
  displayName: string;
  description: string;
  friends: string[];
  pendingInvites: string[];
  reviews: string[];
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
