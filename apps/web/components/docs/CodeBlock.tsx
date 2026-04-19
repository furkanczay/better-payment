interface CodeBlockProps {
  code: string;
  file?: string;
  lang?: string;
}

export default function CodeBlock({ code, file, lang = "typescript" }: CodeBlockProps) {
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-border text-sm">
      {file && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-1">{file}</span>
        </div>
      )}
      <pre className="bg-muted/30 p-5 overflow-x-auto leading-relaxed">
        <code className="font-mono text-xs sm:text-sm text-foreground">{code}</code>
      </pre>
    </div>
  );
}
