export type User = {
  username: string;
  email: string;
  displayName: string;
  description: string;
  friends: string[];
  pendingInvites: string[];
  reviews: string[];
  createdAt: number; // TODO: Replace with Date?
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
  description: string;
};
