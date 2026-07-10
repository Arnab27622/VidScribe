export const pageStyles = {
  loadingWrapper: "min-h-dvh flex items-center justify-center bg-background",
  loadingInner: "flex flex-col items-center gap-4",
  loadingSpinner: "w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin",
  loadingText: "text-muted-foreground font-medium animate-pulse",

  pageWrapper: "min-h-dvh bg-background text-foreground font-sans transition-colors duration-300",
  main: "container mx-auto px-6 py-8 md:py-16 max-w-7xl",

  headerFloating: "fixed right-4 top-2 md:right-8 md:top-8 z-50 flex items-center gap-2 p-1.5 bg-background/50 backdrop-blur-lg rounded-full border border-border/50 shadow-xl",
  headerUserContainer: "hidden md:flex items-center gap-2 pr-2 border-r border-border/50",
  headerUserImage: "w-6 h-6 rounded-full",
  headerUserPlaceholder: "w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center",
  headerUserIcon: "w-3 h-3 text-primary",
  headerUserName: "text-sm font-medium text-foreground",
  signOutButton: "p-2 hover:bg-muted rounded-full transition-colors group flex items-center justify-center text-muted-foreground hover:text-destructive",
  signOutIcon: "w-4 h-4",

  heroGrid: "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-16 pt-12",
  heroTextCol: "lg:col-span-6 flex flex-col gap-6",
  heroTitle: "text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.1] text-foreground",
  heroSubtitle: "text-lg text-muted-foreground leading-relaxed max-w-[45ch]",

  heroInputCol: "lg:col-span-6 lg:pl-12",
  errorMessage: "mt-4 p-4 text-sm text-destructive border border-destructive/20 bg-destructive/5 rounded-none",

  resultsWrapper: "space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
  resultsGrid: "grid grid-cols-1 lg:grid-cols-2 gap-8"
} as const;
