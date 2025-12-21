import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        variables: {
          colorPrimary: "hsl(240 5.9% 10%)",
          colorBackground: "hsl(0 0% 100%)",
          colorText: "hsl(240 10% 3.9%)",
          colorTextSecondary: "hsl(240 3.8% 46.1%)",
          colorInputBackground: "hsl(0 0% 100%)",
          colorInputText: "hsl(240 10% 3.9%)",
          borderRadius: "0.5rem",
        },
        elements: {
          rootBox: "mx-auto w-full",
          card: "shadow-lg border border-border bg-card rounded-xl p-6",
          logoBox: "h-24 w-24 mx-auto",
          logoImage: "h-full w-full object-contain",
          headerTitle: "text-2xl font-bold text-center",
          headerSubtitle: "text-muted-foreground text-center",
          formButtonPrimary:
            "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md h-10 font-medium",
          formFieldInput:
            "border border-input bg-background rounded-md h-10 px-3",
          formFieldLabel: "text-sm font-medium text-foreground",
          footerActionLink: "text-primary hover:text-primary/80 font-medium",
          identityPreviewEditButton: "text-primary hover:text-primary/80",
          formResendCodeLink: "text-primary hover:text-primary/80",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground text-sm",
          socialButtonsBlockButton:
            "border border-input bg-background hover:bg-accent rounded-md h-10",
          socialButtonsBlockButtonText: "text-foreground font-medium",
        },
      }}
    />
  );
}
