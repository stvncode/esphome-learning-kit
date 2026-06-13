import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GLOSSARY } from "@/lib/glossary"
import { BookOpen, Search } from "lucide-react"
import { useMemo, useState } from "react"

export function Glossary() {
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const entries = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term))
    if (!q) return entries
    return entries.filter(
      (e) => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight">Glossary</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Plain-language definitions of the ESPHome and IoT terms you'll meet in the levels.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms…"
          className="pl-9"
        />
      </div>

      {results.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No terms match "{query}".</p>
      ) : (
        <div className="space-y-2">
          {results.map((e) => (
            <Card key={e.term} className="border-border/50">
              <CardContent className="py-3">
                <p className="text-sm font-semibold text-foreground">{e.term}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{e.definition}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
