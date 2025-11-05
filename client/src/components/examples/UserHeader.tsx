import { UserHeader } from "../UserHeader";
import { ThemeProvider } from "../ThemeProvider";
import avatar from "@assets/generated_images/Male_family_member_avatar_a839230d.png";

export default function UserHeaderExample() {
  return (
    <ThemeProvider>
      <div className="bg-background min-h-screen">
        <UserHeader
          user={{
            name: "John Doe",
            email: "john@example.com",
            role: "admin",
            avatar: avatar,
          }}
          onLogout={() => console.log("Logout clicked")}
        />
        <div className="p-8">
          <p className="text-muted-foreground">Content area below header</p>
        </div>
      </div>
    </ThemeProvider>
  );
}
