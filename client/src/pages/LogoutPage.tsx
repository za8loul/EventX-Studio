import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      const token = (() => { try { return localStorage.getItem("accessToken"); } catch { return null; } })();
      try {
        await fetch("/api/users/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            ...(token ? { accesstoken: token } : {}),
          },
        });
      } catch {}
      try { localStorage.removeItem("accessToken"); } catch {}
      window.location.href = "/";
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Signing you out...
    </div>
  );
}


