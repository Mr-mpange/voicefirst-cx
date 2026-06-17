import { useEffect, useState } from "react";
import { Plus, Copy, Check, KeyRound, Loader2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

function randomHex(bytes: number) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const ApiKeys = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [maxKeys, setMaxKeys] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState<{ key: string; secret: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setKeys(data ?? []);
    if (user) {
      const { data: limitRow } = await supabase
        .from("api_key_limits")
        .select("max_keys")
        .eq("user_id", user.id)
        .maybeSingle();
      setMaxKeys(limitRow?.max_keys ?? 5);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setCreating(true);
    try {
      const keyId = randomHex(8);
      const secret = randomHex(24);
      const key_prefix = `vk_live_${keyId}`;
      const fullSecret = `sk_${secret}`;
      const secret_hash = await sha256(fullSecret);

      const { error } = await supabase.from("api_keys").insert({
        user_id: user.id,
        name: name.trim(),
        key_prefix,
        secret_hash,
      });
      if (error) throw error;

      setNewSecret({ key: key_prefix, secret: fullSecret });
      setName("");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Key revoked");
      load();
    }
  };

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <DashboardLayout title="API Keys">
      <div className="max-w-4xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Create key + secret pairs to authenticate with the VoiceAI REST API.
              Secrets are shown once at creation — store them safely.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {keys.filter((k) => !k.revoked_at).length} of {maxKeys} active keys used
              {keys.filter((k) => !k.revoked_at).length >= maxKeys && " — limit reached, ask an admin to raise it."}
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="gap-2"
            disabled={keys.filter((k) => !k.revoked_at).length >= maxKeys}
          >
            <Plus className="h-4 w-4" /> New key
          </Button>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : keys.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              <KeyRound className="h-8 w-8 mx-auto mb-3 opacity-40" />
              No API keys yet. Create your first one.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Name</th>
                  <th className="text-left font-medium px-4 py-2">Key</th>
                  <th className="text-left font-medium px-4 py-2">Created</th>
                  <th className="text-left font-medium px-4 py-2">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-t border-border/40">
                    <td className="px-4 py-3 font-medium">{k.name}</td>
                    <td className="px-4 py-3 font-mono text-xs flex items-center gap-2">
                      {k.key_prefix}
                      <button onClick={() => copy(k.key_prefix, k.id)} className="text-muted-foreground hover:text-foreground">
                        {copied === k.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {k.revoked_at ? (
                        <span className="text-xs text-destructive">Revoked</span>
                      ) : (
                        <span className="text-xs text-success">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!k.revoked_at && (
                        <Button size="sm" variant="ghost" onClick={() => handleRevoke(k.id)} className="gap-1 text-destructive hover:text-destructive">
                          <Ban className="h-3 w-3" /> Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setNewSecret(null);
        }}
      >
        <DialogContent>
          {!newSecret ? (
            <>
              <DialogHeader>
                <DialogTitle>Create new API key</DialogTitle>
                <DialogDescription>Give it a name you'll recognize later.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="key-name">Name</Label>
                <Input
                  id="key-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production server"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!name.trim() || creating}>
                  {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Save your secret now</DialogTitle>
                <DialogDescription>
                  This is the only time we'll show the secret. Store it somewhere safe.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">API Key</Label>
                  <div className="flex items-center gap-2 mt-1 rounded-md border border-border/50 bg-muted/30 px-3 py-2 font-mono text-xs">
                    <span className="flex-1 truncate">{newSecret.key}</span>
                    <button onClick={() => copy(newSecret.key, "k")}>
                      {copied === "k" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Secret</Label>
                  <div className="flex items-center gap-2 mt-1 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 font-mono text-xs">
                    <span className="flex-1 truncate">{newSecret.secret}</span>
                    <button onClick={() => copy(newSecret.secret, "s")}>
                      {copied === "s" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setOpen(false);
                    setNewSecret(null);
                  }}
                >
                  I've saved it
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ApiKeys;