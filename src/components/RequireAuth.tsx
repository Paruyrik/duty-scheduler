import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const user = await window.api.invoke("get-current-user");

      if (!user) {
        router.replace("/login");
        return;
      }

      setIsAuth(true);
      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <>{isAuth && children}</>;
}
