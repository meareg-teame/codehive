export type AuthUser = {
  name: string;
  email: string;
  photoUrl: string;
};

export type V1User = {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  role?: string;
};
