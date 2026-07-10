export const sharedVideoStyles = {
  pageWrapper: "min-h-dvh bg-background text-foreground font-sans transition-colors duration-300",
  main: "container mx-auto px-6 py-8 md:py-16 max-w-7xl",

  headerFloating: "fixed right-4 top-2 md:right-8 md:top-8 z-50 p-1 bg-background/50 backdrop-blur-lg rounded-full border border-white/10 shadow-xl",
  
  backLinkContainer: "mb-8 flex items-center",
  backLink: "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium",
  backIcon: "w-4 h-4",

  errorMessage: "mt-4 p-4 text-sm text-destructive border border-destructive/20 bg-destructive/5 rounded-none",

  resultsWrapper: "space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
  resultsGrid: "grid grid-cols-1 lg:grid-cols-2 gap-8"
} as const;
