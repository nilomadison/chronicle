"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { searchArchive, type SearchResult } from "@/actions/search";
import { Button, Badge, Spinner } from "@/components/ui";
import styles from "../archive.module.css";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      setSearching(true);
      setHasSearched(true);
      try {
        const searchResults = await searchArchive(query.trim());
        setResults(searchResults);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [query]
  );

  return (
    <div className={styles.searchPage}>
      <div className={styles.searchHeader}>
        <h1>Search the Archive</h1>
        <p className={styles.headerDesc}>
          Find stories by theme, topic, emotion, or any phrase that resonates.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className={styles.searchBar}
        style={{ marginBottom: "var(--space-8)" }}
      >
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search for stories about resilience, childhood, cooking…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <Button type="submit" disabled={searching || !query.trim()}>
          {searching ? "Searching…" : "Search"}
        </Button>
      </form>

      {searching && <Spinner size="lg" label="Searching the archive…" fullPage />}

      {!searching && hasSearched && (
        <>
          <p className={styles.resultCount}>
            {results.length} {results.length === 1 ? "story" : "stories"} found
          </p>

          {results.length > 0 ? (
            <div className={styles.resultsList}>
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/archive/${result.id}`}
                  className={styles.resultCard}
                >
                  <h3 className={styles.storyTitle}>{result.title}</h3>
                  <p className={styles.storyExcerpt}>{result.excerpt}</p>
                  <div className={styles.storyMeta}>
                    <span className={styles.storyDate}>
                      {result.publishedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {result.tags.length > 0 && (
                      <div className={styles.tags}>
                        {result.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="amber">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.searchEmptyState}>
              <p>No stories matched your search. Try different words or themes.</p>
            </div>
          )}
        </>
      )}

      {!searching && !hasSearched && (
        <div className={styles.searchEmptyState}>
          <p>Enter a search to explore the archive.</p>
        </div>
      )}
    </div>
  );
}
