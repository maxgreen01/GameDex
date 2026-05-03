// holds all the types needed for typescript
// types/game.ts
import { FaWindows, FaPlaystation, FaXbox, FaApple, FaLinux } from "react-icons/fa";
import { BsNintendoSwitch } from "react-icons/bs";
import { IoLogoAndroid } from "react-icons/io";
import { MdOutlinePhoneIphone } from "react-icons/md";
import type { IconType } from "react-icons";
import type { User } from "firebase/auth";

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

export const allPlatforms: Record<string, IconType> = {
  pc: FaWindows,
  playstation4: FaPlaystation,
  playstation5: FaPlaystation,
  "xbox-one": FaXbox,
  "xbox-series-x": FaXbox,
  xbox360: FaXbox,
  "nintendo-switch": BsNintendoSwitch,
  ios: MdOutlinePhoneIphone,
  android: IoLogoAndroid,
  macos: FaApple,
  linux: FaLinux,
};

type FirebaseUser = User | null;

export interface userDetails {
  user: FirebaseUser;
  username: string;
  displayName: string;
}

export interface ReviewType {
  _id?: string;
  gameId: string;
  gameTitle: string;
  userId: string;
  displayName: string;
  rating: number;
  text: string;
  createdAt: /*?*/ string;
  updatedAt: /*?*/ string;
}
