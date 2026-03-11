@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

@layer base {
  body {
    @apply font-sans antialiased text-slate-900 min-h-screen;
    background: 
      radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 1) 0%, #f8fafc 100%);
    background-attachment: fixed;
  }
}

.glass-card {
  @apply bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50;
}

.vibrant-gradient {
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
}

