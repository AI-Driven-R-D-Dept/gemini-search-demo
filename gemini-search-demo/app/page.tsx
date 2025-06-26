"use client";

import { useState } from "react";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StructuredResult {
  title: string;
  description: string;
  comment: string;
  url?: string;
  domain?: string;
}

interface SearchResult {
  answer: string;
  structuredResults: StructuredResult[];
  groundingMetadata?: any;
  searchQueries: string[];
  sources: Array<{
    uri: string;
    title?: string;
    domain?: string;
  }>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("検索に失敗しました");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Gemini Search Demo</h1>
          <p className="text-muted-foreground">
            Google検索グラウンディング機能を使用したGemini APIのデモ
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="検索したい内容を入力してください..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              検索
            </Button>
          </div>
        </form>

        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            {result.structuredResults.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>検索結果</CardTitle>
                  <CardDescription>
                    構造化された検索結果
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.structuredResults.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-semibold text-lg flex-1">{item.title}</h3>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-primary hover:underline flex-shrink-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {item.domain || "リンク"}
                            </a>
                          )}
                        </div>
                        <p className="text-muted-foreground">{item.description}</p>
                        <p className="text-sm font-medium text-primary bg-primary/10 rounded-md px-3 py-2">
                          💬 {item.comment}
                        </p>
                        {item.url && (
                          <div className="text-xs text-muted-foreground truncate">
                            {item.url}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>回答</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap">{result.answer}</div>
                </CardContent>
              </Card>
            )}

            {result.searchQueries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>検索クエリ</CardTitle>
                  <CardDescription>
                    Geminiが使用した検索キーワード
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {result.searchQueries.map((q, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {q}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.sources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>参照元</CardTitle>
                  <CardDescription>
                    回答の生成に使用されたWebページ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.sources.map((source, index) => (
                      <li key={index} className="border rounded-lg p-3">
                        <a
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:bg-muted/50 rounded transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <ExternalLink className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm line-clamp-2">
                                {source.title || "Untitled"}
                              </div>
                              {source.domain && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {source.domain}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                {source.uri}
                              </div>
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  );
}