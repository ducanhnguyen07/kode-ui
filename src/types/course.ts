import { Lab } from "./lab";
import { User } from "./user";

export interface Course {
  id: number;
  title: string;
  description: string;
  short_description: string;
  level: string;
  labs: Lab[];
  studentsCount?: number;
  category?: string;
  lecturer?: User;
  updatedAt?: string;
}
