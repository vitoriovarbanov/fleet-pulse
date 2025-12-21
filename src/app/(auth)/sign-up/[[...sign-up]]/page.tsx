import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        variables: {
          // FleetPulse Premium Theme - Sapphire Blue + Electric Cyan
          // Using CSS variables to support both light and dark modes
          colorPrimary: "oklch(0.50 0.18 250)", // Sapphire blue (works in both modes)
          colorBackground: "transparent",
          colorText: "var(--foreground)",
          colorTextSecondary: "var(--muted-foreground)",
          colorInputBackground: "var(--input)",
          colorInputText: "var(--foreground)",
          colorDanger: "var(--destructive)",
          colorSuccess: "oklch(0.60 0.17 155)", // Emerald
          colorWarning: "oklch(0.65 0.15 75)", // Amber
          borderRadius: "0.625rem",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          fontFamilyButtons: "var(--font-sans), system-ui, sans-serif",
          spacingUnit: "1rem",
        },
        elements: {
          // Root container - ensure full width and centering on mobile
          rootBox: "w-full max-w-full mx-auto",
          card: "bg-transparent shadow-none p-0 w-full",
          cardBox: "w-full",

          // Header
          header: "!gap-0 w-full",
          headerTitle:
            "text-xl font-semibold text-foreground tracking-tight text-center w-full",
          headerSubtitle: "text-muted-foreground text-center mt-1 text-sm w-full",

          // Logo
          logoBox: "!h-32 !w-32 mx-auto flex items-center justify-center",
          logoImage: "!h-full !w-full !max-h-full !max-w-full object-contain",

          // Primary button - Sapphire blue
          formButtonPrimary: `
            bg-primary text-primary-foreground
            font-medium text-sm
            hover:bg-primary/90
            transition-all duration-200
            rounded-lg h-10 w-full
            shadow-md shadow-primary/25
            hover:shadow-lg hover:shadow-primary/30
            hover:scale-[1.01]
            active:scale-[0.99]
          `,
          formFieldInput: `
            border border-border
            bg-input
            rounded-lg h-10 px-3 text-sm w-full
            text-foreground placeholder:text-muted-foreground
            focus:border-primary/60 focus:ring-2 focus:ring-primary/25
            transition-all duration-200
          `,
          formFieldLabel: "text-xs font-medium text-foreground mb-1.5",
          formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground transition-colors",
          formFieldAction: "text-secondary hover:text-secondary/80 text-sm font-medium transition-colors",
          formFieldHintText: "text-muted-foreground text-xs mt-1",
          formFieldErrorText: "text-destructive text-xs mt-1",
          formFieldSuccessText: "text-green-600 dark:text-emerald-400 text-xs mt-1",
          formFieldWarningText: "text-amber-600 dark:text-amber-400 text-xs mt-1",
          formFieldRow: "w-full",

          // Identity preview
          identityPreview: `
            bg-muted border border-border
            rounded-lg p-4 w-full
          `,
          identityPreviewText: "text-foreground",
          identityPreviewEditButton: `
            text-secondary hover:text-secondary/80
            transition-colors duration-200 font-medium
          `,

          // Footer - fix mobile centering
          footer: "w-full flex flex-col items-center justify-center text-center mt-4",
          footerAction: "w-full text-center",
          footerActionText: "text-muted-foreground text-sm",
          footerActionLink: `
            text-secondary hover:text-secondary/80
            font-medium transition-colors duration-200
          `,
          footerPages: "w-full flex flex-col items-center justify-center",
          footerPagesLink: "text-muted-foreground text-xs",

          // Divider
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground text-xs bg-transparent px-3",
          dividerRow: "my-4 w-full",

          // Social buttons
          socialButtonsBlockButton: `
            border border-border
            bg-muted
            hover:bg-accent
            hover:border-border
            rounded-lg h-10 w-full
            transition-all duration-200
          `,
          socialButtonsBlockButtonText: "text-foreground font-medium text-sm",
          socialButtonsBlockButtonArrow: "text-muted-foreground",
          socialButtonsProviderIcon: "w-5 h-5",
          socialButtons: "w-full",

          // Alternative methods
          alternativeMethods: "mt-4 w-full",
          alternativeMethodsBlockButton: `
            border border-border
            bg-muted
            hover:bg-accent
            hover:border-border
            rounded-lg h-10 w-full
            transition-all duration-200
          `,
          alternativeMethodsBlockButtonText: "text-foreground font-medium text-sm",

          // OTP input
          otpCodeFieldInput: `
            border border-border
            bg-input
            rounded-lg
            text-foreground text-center text-lg font-mono
            focus:border-primary/60 focus:ring-2 focus:ring-primary/25
            transition-all duration-200
          `,

          // Verification links
          formResendCodeLink: `
            text-secondary hover:text-secondary/80
            font-medium transition-colors duration-200 text-sm
          `,

          // Loading states
          spinner: "text-primary",

          // Alert
          alert: `
            bg-muted border border-border
            rounded-lg p-4 w-full
          `,
          alertText: "text-foreground/80",

          // User button
          userButtonAvatarBox: "w-9 h-9 rounded-full",
          userButtonTrigger: `
            rounded-full
            focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
          `,

          // Internal styling
          internal: "font-sans",

          // Back button
          backLink: `
            text-muted-foreground hover:text-foreground
            transition-colors duration-200 text-sm
          `,

          // Form container
          form: "space-y-3 w-full",

          // Main content
          main: "space-y-4 w-full",

          // Badge
          badge: `
            bg-primary/15 text-primary
            border border-primary/25
            rounded-full px-2.5 py-0.5 text-xs font-medium
          `,

          // Select
          selectButton: `
            border border-border
            bg-input
            rounded-lg h-11 w-full
            text-foreground
            hover:border-border
            transition-all duration-200
          `,
          selectOptionsContainer: `
            bg-card border border-border
            rounded-lg shadow-xl
          `,
          selectOption: `
            text-foreground/80
            hover:bg-muted hover:text-foreground
            transition-colors duration-150
          `,

          // Phone input
          phoneInputBox: `
            border border-border
            bg-input
            rounded-lg w-full
          `,
        },
      }}
    />
  );
}
