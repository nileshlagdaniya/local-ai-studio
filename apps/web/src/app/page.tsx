export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Local AI Studio</h1>
        <p className="text-lg text-muted-foreground">
          Local-first AI automation platform
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/modules/stock-content-factory"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Get Started
          </a>
          <a
            href="https://github.com/nileshlagdaniya/local-ai-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-input bg-background px-4 py-2 text-foreground hover:bg-accent"
          >
            GitHub
          </a>
        </div>
      </div>
    </main>
  );
}