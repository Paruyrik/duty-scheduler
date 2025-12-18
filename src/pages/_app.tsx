//src/pages/_app.tsx
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { DepartmentProvider } from "@/context/DepartmentContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DepartmentProvider>
      <Provider>
        <Component {...pageProps} />
        <Toaster />
      </Provider>
    </DepartmentProvider>
  );
}
