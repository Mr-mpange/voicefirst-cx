import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading } = useRole();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default AdminRoute;