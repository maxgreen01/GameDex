export type User = {
  username: string;
  email: string;
  displayName: string;
  description: string;
  friends: string[];
  pendingInvites: string[];
  reviews: string[];
  createdAt: number; // TODO: Replace with Date?
}

export type ProfileData = {
  displayName: string;
  description: string;
}
