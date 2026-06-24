import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  Search, Plus, Edit, Trash2, Upload, FileText, Loader2, X, Save, Eye,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHero from "@/components/layout/PageHero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CATEGORIES = ["General", "Account", "Billing", "Technical", "Policy", "Process"];

interface KnowledgeEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  source_file_name: string | null;
  source_file_path: string | null;
  extracted_text: string | null;
  created_at: string;
  updated_at: string;
}

const KnowledgeBase = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formContent, setFormContent] = useState("");

  // View dialog
  const [viewEntry, setViewEntry] = useState<KnowledgeEntry | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);

  // Fetch entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["knowledge-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_entries")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as KnowledgeEntry[];
    },
  });

  // Create / Update
  const saveMutation = useMutation({
    mutationFn: async (entry: { id?: string; title: string; category: string; content: string }) => {
      if (entry.id) {
        const { error } = await supabase
          .from("knowledge_entries")
          .update({ title: entry.title, category: entry.category, content: entry.content })
          .eq("id", entry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("knowledge_entries")
          .insert({ title: entry.title, category: entry.category, content: entry.content, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-entries"] });
      toast.success(editingEntry ? "Entry updated!" : "Entry created!");
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Also delete associated file if any
      const entry = entries.find((e) => e.id === id);
      if (entry?.source_file_path) {
        await supabase.storage.from("knowledge-files").remove([entry.source_file_path]);
      }
      const { error } = await supabase.from("knowledge_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-entries"] });
      toast.success("Entry deleted!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  const openCreate = () => {
    setEditingEntry(null);
    setFormTitle("");
    setFormCategory("General");
    setFormContent("");
    setDialogOpen(true);
  };

  const openEdit = (entry: KnowledgeEntry) => {
    setEditingEntry(entry);
    setFormTitle(entry.title);
    setFormCategory(entry.category);
    setFormContent(entry.content);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingEntry(null);
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    saveMutation.mutate({
      id: editingEntry?.id,
      title: formTitle.trim(),
      category: formCategory,
      content: formContent.trim(),
    });
  };

  // File upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!user) return;
      setUploading(true);

      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const allowed = ["pdf", "docx", "txt", "md", "csv", "json"];
        if (!allowed.includes(ext)) {
          toast.error(`Unsupported file type: .${ext}. Use PDF, DOCX, TXT, MD, CSV, or JSON.`);
          return;
        }

        // Create the knowledge entry first
        const { data: entry, error: insertError } = await supabase
          .from("knowledge_entries")
          .insert({
            title: file.name.replace(/\.[^.]+$/, ""),
            category: "General",
            content: "Processing file...",
            source_file_name: file.name,
            user_id: user.id,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        // Upload file to storage
        const filePath = `${user.id}/${entry.id}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("knowledge-files")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Update entry with file path
        await supabase
          .from("knowledge_entries")
          .update({ source_file_path: filePath })
          .eq("id", entry.id);

        // Trigger processing
        toast.info("File uploaded! Processing content...");

        const { error: processError } = await supabase.functions.invoke(
          "process-knowledge-file",
          { body: { entryId: entry.id, filePath } }
        );

        if (processError) {
          console.error("Processing error:", processError);
          toast.warning("File uploaded but processing failed. You can edit the content manually.");
        } else {
          toast.success("File processed and knowledge extracted!");
        }

        queryClient.invalidateQueries({ queryKey: ["knowledge-entries"] });
      } catch (e: any) {
        toast.error(e.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [user, queryClient]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const filtered = entries.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const allCategories = ["All", ...CATEGORIES];

  return (
    <DashboardLayout title="Knowledge Base">
      <Helmet>
        <title>Knowledge Base — VoiceAI</title>
        <meta name="description" content="Manage the knowledge that powers your VoiceAI agent. Upload documents, add FAQs, and organize what Alex tells your customers." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://audient-assist-pro.lovable.app/knowledge-base" />
        <meta property="og:title" content="Knowledge Base — VoiceAI" />
        <meta property="og:description" content="Curate the documents and FAQs that your AI agent uses on every call." />
        <meta property="og:url" content="https://audient-assist-pro.lovable.app/knowledge-base" />
      </Helmet>
      <PageHero
        icon={BookOpen}
        eyebrow="Grounded knowledge"
        title="What Alex"
        accent="knows"
        description="Upload documents, add FAQs, and curate the answers your AI voice agent grounds every response in — no hallucinations, just your truth."
        meta={
          <>
            <span className="text-[11px] px-2.5 py-1 rounded-full border border-border/60 bg-background/50 text-muted-foreground">
              {entries.length} entries
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary">
              {CATEGORIES.length} categories
            </span>
          </>
        }
      />
      {/* Search & actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Label htmlFor="kb-search" className="sr-only">Search knowledge base</Label>
          <Input
            id="kb-search"
            placeholder="Search knowledge base..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50"
          />
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Entries grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground mb-8">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            {entries.length === 0
              ? "No knowledge entries yet. Add one or upload a file!"
              : "No entries match your search."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {filtered.map((entry) => (
            <Card key={entry.id} className="p-4 border-border/50">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground truncate">{entry.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {entry.category}
                    </span>
                    {entry.source_file_name && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        📎 {entry.source_file_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label={`View ${entry.title}`}
                    onClick={() => setViewEntry(entry)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label={`Edit ${entry.title}`}
                    onClick={() => openEdit(entry)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    aria-label={`Delete ${entry.title}`}
                    onClick={() => {
                      if (confirm("Delete this entry?")) deleteMutation.mutate(entry.id);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">{entry.content}</p>
              <p className="text-[10px] text-muted-foreground mt-2">
                Updated: {new Date(entry.updated_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <Card
        className="border-2 border-dashed border-border/50 p-8 transition-colors hover:border-primary/30"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {uploading ? "Processing file..." : "Upload Documents"}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag & drop PDF, DOCX, TXT, CSV, or JSON files — AI will extract and summarize content
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.csv,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            className="gap-2"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="h-4 w-4" />
            Browse Files
          </Button>
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Entry" : "Add Knowledge Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="kb-title">Title</Label>
            <Input
              id="kb-title"
              placeholder="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="bg-background border-border/50"
            />
            <Label htmlFor="kb-category">Category</Label>
            <Select value={formCategory} onValueChange={setFormCategory}>
              <SelectTrigger id="kb-category" className="bg-background border-border/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="kb-content">Content</Label>
            <Textarea
              id="kb-content"
              placeholder="Content / business logic description..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="bg-background border-border/50 min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingEntry ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
        <DialogContent className="bg-card max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewEntry?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {viewEntry?.category}
                </span>
                {viewEntry?.source_file_name && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    📎 {viewEntry.source_file_name}
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Content / Summary
                </h4>
                <p className="text-sm text-foreground whitespace-pre-line">{viewEntry?.content}</p>
              </div>
              {viewEntry?.extracted_text && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Extracted Text
                  </h4>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg max-h-64 overflow-y-auto">
                    {viewEntry.extracted_text.slice(0, 5000)}
                    {(viewEntry.extracted_text?.length || 0) > 5000 && "\n\n... (truncated)"}
                  </pre>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default KnowledgeBase;
