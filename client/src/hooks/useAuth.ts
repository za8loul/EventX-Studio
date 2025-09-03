import { useQuery } from "@tanstack/react-query";
import type { User } from "../../../shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/users/profile"],
    retry: false,
    select: (data: any) => data?.user as User,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };
}