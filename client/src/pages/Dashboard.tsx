import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  FileText, MessageSquare, DollarSign, Eye, CheckCircle, XCircle,
  Clock, ArrowLeft, Sparkles, StickyNote, LogOut
} from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

type Application = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  programInterest: string;
  currentEducation?: string | null;
  employmentStatus?: string | null;
  amountRequested: string;
  financialStatement?: string | null;
  essay: string;
  status: string;
  aiAnalysis?: string | null;
  createdAt: Date;
};

type Referral = {
  id: number;
  applicationId: number;
  referrerName: string;
  referrerEmail: string;
  relationship: string;
};

type Note = {
  id: number;
  applicationId: number;
  content: string;
  authorName?: string | null;
  createdAt: Date;
};

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  // Queries
  const { data: applications, refetch: refetchApps } = trpc.admin.applications.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: messages, refetch: refetchMessages } = trpc.admin.messages.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: donations } = trpc.admin.donations.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: appDetail, refetch: refetchAppDetail } = trpc.admin.applications.get.useQuery(
    { id: selectedApp! },
    { enabled: !!selectedApp }
  );
  const referrals = appDetail?.referrals;
  const notes = appDetail?.notes;
  const refetchNotes = refetchAppDetail;

  // Mutations
  const updateStatusMutation = trpc.admin.applications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetchApps();
      refetchAppDetail();
    },
  });
  const addNoteMutation = trpc.admin.applications.addNote.useMutation({
    onSuccess: () => {
      toast.success("Note added");
      setNoteText("");
      refetchNotes();
    },
  });
  const aiAnalyzeMutation = trpc.admin.applications.aiAnalyze.useMutation({
    onSuccess: () => {
      toast.success("AI analysis complete");
      refetchApps();
    },
  });
  const markReadMutation = trpc.admin.messages.markRead.useMutation({
    onSuccess: () => refetchMessages(),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mb-6">
              Sign in to access the RadAcad Foundation admin panel.
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full">Sign In</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have admin privileges. Contact the foundation administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "denied":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Denied</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  // Detail view for a selected application
  if (selectedApp && appDetail) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="border-b bg-white">
          <div className="container py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedApp(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
            </Button>
            <div className="flex items-center gap-2">
              {statusBadge(appDetail.status)}
              <Select
                value={appDetail.status}
                onValueChange={(val) => updateStatusMutation.mutate({ id: selectedApp, status: val as any })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {appDetail.firstName} {appDetail.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Email:</span> {appDetail.email}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {appDetail.phone || "N/A"}</div>
                    <div><span className="text-muted-foreground">Program:</span> {appDetail.programInterest}</div>
                    <div><span className="text-muted-foreground">Amount Requested:</span> <span className="font-bold">${appDetail.amountRequested}</span></div>
                    <div><span className="text-muted-foreground">Education:</span> {appDetail.currentEducation || "N/A"}</div>
                    <div><span className="text-muted-foreground">Employment:</span> {appDetail.employmentStatus || "N/A"}</div>
                  </div>
                </CardContent>
              </Card>

              {appDetail.financialStatement && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Financial Statement</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{appDetail.financialStatement}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle className="text-base">Essay / Personal Statement</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{appDetail.essay}</p>
                </CardContent>
              </Card>

              {/* Referrals */}
              <Card>
                <CardHeader><CardTitle className="text-base">Referrals</CardTitle></CardHeader>
                <CardContent>
                  {referrals && referrals.length > 0 ? (
                    <div className="space-y-3">
                      {(referrals as Referral[]).map((ref) => (
                        <div key={ref.id} className="border border-border rounded-lg p-3">
                          <p className="font-medium text-sm">{ref.referrerName}</p>
                          <p className="text-xs text-muted-foreground">{ref.referrerEmail}</p>
                          <p className="text-xs text-muted-foreground">Relationship: {ref.relationship}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No referrals submitted.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appDetail.aiAnalysis ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{appDetail.aiAnalysis}</p>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">No analysis yet.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => aiAnalyzeMutation.mutate({ id: selectedApp })}
                        disabled={aiAnalyzeMutation.isPending}
                      >
                        {aiAnalyzeMutation.isPending ? "Analyzing..." : "Run AI Analysis"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <StickyNote className="h-4 w-4" /> Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notes && (notes as Note[]).length > 0 ? (
                    (notes as Note[]).map((note) => (
                      <div key={note.id} className="border-l-2 border-accent pl-3 py-1">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {note.authorName || "Admin"} &middot; {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No notes yet.</p>
                  )}
                  <Separator />
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    rows={3}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (noteText.trim()) {
                        addNoteMutation.mutate({ applicationId: selectedApp, authorName: user?.name || "Admin", content: noteText });
                      }
                    }}
                    disabled={addNoteMutation.isPending || !noteText.trim()}
                  >
                    Add Note
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard list view
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            RadAcad Foundation Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applications?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{donations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Donations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{messages?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Messages</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="applications">
          <TabsList className="mb-6">
            <TabsTrigger value="applications" className="gap-2">
              <FileText className="h-4 w-4" /> Applications
            </TabsTrigger>
            <TabsTrigger value="donations" className="gap-2">
              <DollarSign className="h-4 w-4" /> Donations
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Messages
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Applicant</th>
                        <th className="text-left p-4 font-medium">Program</th>
                        <th className="text-left p-4 font-medium">Amount</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications && applications.length > 0 ? (
                        (applications as Application[]).map((app) => (
                          <tr key={app.id} className="border-b hover:bg-muted/30">
                            <td className="p-4">
                              <p className="font-medium">{app.firstName} {app.lastName}</p>
                              <p className="text-xs text-muted-foreground">{app.email}</p>
                            </td>
                            <td className="p-4">{app.programInterest}</td>
                            <td className="p-4 font-semibold">${app.amountRequested}</td>
                            <td className="p-4">{statusBadge(app.status)}</td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedApp(app.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No applications yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Donor</th>
                        <th className="text-left p-4 font-medium">Amount</th>
                        <th className="text-left p-4 font-medium">Frequency</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations && donations.length > 0 ? (
                        donations.map((d: any) => (
                          <tr key={d.id} className="border-b hover:bg-muted/30">
                            <td className="p-4">
                              <p className="font-medium">{d.firstName} {d.lastName}</p>
                              <p className="text-xs text-muted-foreground">{d.email}</p>
                            </td>
                            <td className="p-4 font-semibold">${d.amount}</td>
                            <td className="p-4">
                              <Badge variant="outline">{d.frequency === "monthly" ? "Monthly" : "One-Time"}</Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={d.status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>
                                {d.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(d.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No donations yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">From</th>
                        <th className="text-left p-4 font-medium">Subject</th>
                        <th className="text-left p-4 font-medium">Message</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages && messages.length > 0 ? (
                        messages.map((m: any) => (
                          <tr key={m.id} className="border-b hover:bg-muted/30">
                            <td className="p-4">
                              <p className="font-medium">{m.firstName} {m.lastName}</p>
                              <p className="text-xs text-muted-foreground">{m.email}</p>
                            </td>
                            <td className="p-4 font-medium">{m.subject}</td>
                            <td className="p-4 max-w-xs truncate text-muted-foreground">{m.message}</td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              {m.isRead ? (
                                <Badge className="bg-muted text-muted-foreground hover:bg-muted">Read</Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markReadMutation.mutate({ id: m.id })}
                                >
                                  Mark Read
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No messages yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
