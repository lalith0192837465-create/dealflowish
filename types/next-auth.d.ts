import { Role } from "@/config/roles";

declare module "next-auth" {
  interface Session {
    roles?: Role[];
  }
}
