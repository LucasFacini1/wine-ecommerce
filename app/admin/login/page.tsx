import { Suspense } from "react";
import { getStoreHref, isOnAdminHost } from "@/lib/store-link";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  const [storeHref, onAdminHost] = await Promise.all([
    getStoreHref(),
    isOnAdminHost(),
  ]);

  return (
    <Suspense fallback={null}>
      <LoginForm storeHref={storeHref} onAdminHost={onAdminHost} />
    </Suspense>
  );
}
