import AppToaster from "@/components/common/AppToaster";
import ClientLayout from "./ClientLayout";
import "./globals.css";

// eslint-disable-next-line react/prop-types
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppToaster />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}