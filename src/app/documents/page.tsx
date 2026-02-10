'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  FolderOpen,
  Search,
  Plus,
  MoreHorizontal,
  Clock,
  User,
  ChevronRight,
  Book,
  Code,
  FileCode,
  ScrollText,
} from 'lucide-react';

// Document type
interface Document {
  id: string;
  title: string;
  category: string;
  updatedAt: string;
  createdBy: string;
  preview?: string;
}

const categories = [
  { id: 'all', label: 'All', icon: FolderOpen },
  { id: 'plan', label: 'Plans', icon: ScrollText },
  { id: 'spec', label: 'Specs', icon: FileCode },
  { id: 'api', label: 'API Docs', icon: Code },
  { id: 'guide', label: 'Guides', icon: Book },
];

const documents: Document[] = [
  {
    id: 'doc-1',
    title: 'ProjectHub Architecture Overview',
    category: 'plan',
    updatedAt: '2026-02-10',
    createdBy: 'Delta',
  },
  {
    id: 'doc-2',
    title: 'DrillCore AI Technical Specifications',
    category: 'spec',
    updatedAt: '2026-02-09',
    createdBy: 'Delta',
  },
  {
    id: 'doc-3',
    title: 'Kanban Board API Documentation',
    category: 'api',
    updatedAt: '2026-02-08',
    createdBy: 'Delta',
  },
  {
    id: 'doc-4',
    title: 'Setup and Installation Guide',
    category: 'guide',
    updatedAt: '2026-02-07',
    createdBy: 'Delta',
  },
  {
    id: 'doc-5',
    title: 'DrillCore AI Project Plan',
    category: 'plan',
    updatedAt: '2026-02-10',
    createdBy: 'Delta',
  },
];

function getCategoryIcon(category: string) {
  switch (category) {
    case 'plan':
      return <ScrollText className="h-4 w-4" />;
    case 'spec':
      return <FileCode className="h-4 w-4" />;
    case 'api':
      return <Code className="h-4 w-4" />;
    case 'guide':
      return <Book className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'plan':
      return 'bg-blue-500/10 text-blue-500';
    case 'spec':
      return 'bg-violet-500/10 text-violet-500';
    case 'api':
      return 'bg-emerald-500/10 text-emerald-500';
    case 'guide':
      return 'bg-amber-500/10 text-amber-500';
    default:
      return 'bg-slate-500/10 text-slate-500';
  }
}

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Header
        title="Documents"
        subtitle="Project documentation and resources"
        // @ts-expect-error - Custom action slot
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-4 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring w-64"
              />
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{cat.label}</span>
                        </div>
                        {cat.id !== 'all' && (
                          <span className="text-xs opacity-70">
                            {documents.filter((d) => d.category === cat.id).length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Document List */}
          <div className="flex-1">
            <div className="grid gap-3">
              {filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${getCategoryColor(
                            doc.category
                          )}`}
                        >
                          {getCategoryIcon(doc.category)}
                        </div>
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {doc.createdBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {doc.updatedAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredDocuments.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
