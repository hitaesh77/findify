"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && pathname !== "/login") {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);
  if (!isAuthorized && pathname !== "/login") {
    return <div style={{ padding: "2rem" }}>Loading...</div>; 
  }
  return <>{children}</>;
}