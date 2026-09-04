export const metadata = { title: "DealFlow" };
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#0b0d12", color: "#e7e9ee", margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
