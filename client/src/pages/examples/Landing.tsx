import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "../Landing";

export default function LandingExample() {
  return (
    <ThemeProvider>
      <Landing />
    </ThemeProvider>
  );
}
