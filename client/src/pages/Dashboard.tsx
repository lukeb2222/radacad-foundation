import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, MessageSquare, DollarSign, BarChart3, Eye, CheckCircle, XCircle,
  Clock, Sparkles, Lock, Mail, MailOpen, Archive, Trash2, ExternalLink,
  RefreshCw, Download, Copy, Link2, Users, Star, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

type Application = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  programInterest: string;
  currentEducation?: string | null;
  employmentStatus?: string | null;
  amountRequested: string;
  financialStatement?: string | null;
  essay: string;
  status: string;
  aiAnalysis?: string | null;
  aiAnalysisGeneratedAt?: Date | null;
  overallScore?: number | null;
  committeeNotes?: string | null;
  createdAt: Date;
};

type CommitteeIdentity = { name: string; email: string };

// ─── Dashboard Component ────────────────────────────────────────────────────

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [identity, setIdentity] = useState<CommitteeIdentity | null>(null);
  const [showIdentityDialog, setShowIdentityDialog] = useState(false);
  const [identityName, setIdentityName] = useState("");
  const [identityEmail, setIdentityEmail] = useState("");
  const [activeTab, setActiveTab] = useState("applications");
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Check for access token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (key) {
      validateMutation.mutate({ token: key });
    }
    // Check localStorage for identity
    const stored = localStorage.getItem("committee_identity");
    if (stored) {
      try {
        setIdentity(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Mutations
  const validateMutation = trpc.committee.validateAccess.useMutation({
    onSuccess: (data) => {
      if (data.valid) {
        setIsAuthenticated(true);
        const stored = localStorage.getItem("committee_identity");
        if (!stored) setShowIdentityDialog(true);
      } else {
        toast.error("Invalid password or access link");
      }
    },
  });

  const registerMemberMutation = trpc.committee.registerMember.useMutation();

  // Queries (only when authenticated)
  const { data: applications, refetch: refetchApps } = trpc.committee.applications.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
  const { data: appStats } = trpc.committee.applications.stats.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
  const { data: messagesData, refetch: refetchMessages } = trpc.committee.messages.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
  const { data: messageStats } = trpc.committee.messages.stats.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
  const { data: donorsData, refetch: refetchDonors } = trpc.committee.donors.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
  const { data: donorStats } = trpc.committee.donors.stats.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
  const { data: accessTokens, refetch: refetchTokens } = trpc.committee.accessTokens.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: fundraisingData } = trpc.committee.fundraising.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Application detail
  const { data: appDetail, refetch: refetchAppDetail } = trpc.committee.applications.get.useQuery(
    { id: selectedAppId!, reviewerEmail: identity?.email || undefined },
    { enabled: !!selectedAppId && isAuthenticated }
  );

  // Application mutations
  const updateStatusMutation = trpc.committee.applications.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); refetchApps(); refetchAppDetail(); },
  });
  const addNoteMutation = trpc.committee.applications.addNote.useMutation({
    onSuccess: () => { toast.success("Note added"); refetchAppDetail(); },
  });
  const aiAnalyzeMutation = trpc.committee.applications.aiAnalyze.useMutation({
    onSuccess: () => { toast.success("AI analysis complete"); refetchAppDetail(); },
  });
  const addReviewMutation = trpc.committee.reviews.add.useMutation({
    onSuccess: () => { toast.success("Review submitted"); refetchAppDetail(); },
  });
  const updateScoreMutation = trpc.committee.applications.updateScore.useMutation({
    onSuccess: () => { toast.success("Score updated"); refetchAppDetail(); },
  });

  // Message mutations
  const markReadMutation = trpc.committee.messages.markRead.useMutation({
    onSuccess: () => refetchMessages(),
  });
  const archiveMessageMutation = trpc.committee.messages.archive.useMutation({
    onSuccess: () => { toast.success("Archived"); refetchMessages(); },
  });
  const unarchiveMessageMutation = trpc.committee.messages.unarchive.useMutation({
    onSuccess: () => { toast.success("Restored"); refetchMessages(); },
  });
  const deleteMessageMutation = trpc.committee.messages.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); refetchMessages(); },
  });

  // Donor mutations
  const markThankYouMutation = trpc.committee.donors.markThankYou.useMutation({
    onSuccess: () => { toast.success("Marked as sent"); refetchDonors(); },
  });
  const deleteDonorMutation = trpc.committee.donors.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); refetchDonors(); },
  });

  // Access token mutations
  const createTokenMutation = trpc.committee.accessTokens.create.useMutation({
    onSuccess: (data) => {
      const url = `${window.location.origin}/dashboard?key=${data.token}`;
      navigator.clipboard.writeText(url);
      toast.success("Access link created and copied to clipboard!");
      refetchTokens();
    },
  });
  const revokeTokenMutation = trpc.committee.accessTokens.revoke.useMutation({
    onSuccess: () => { toast.success("Token revoked"); refetchTokens(); },
  });

  // Fundraising mutations
  const updateFundraisingMutation = trpc.committee.fundraising.update.useMutation({
    onSuccess: () => toast.success("Fundraising settings saved"),
  });

  const handleLogin = () => {
    validateMutation.mutate({ password });
  };

  const handleIdentitySave = () => {
    if (!identityName.trim() || !identityEmail.trim()) {
      toast.error("Please enter your name and email");
      return;
    }
    const id = { name: identityName.trim(), email: identityEmail.trim() };
    setIdentity(id);
    localStorage.setItem("committee_identity", JSON.stringify(id));
    registerMemberMutation.mutate(id);
    setShowIdentityDialog(false);
  };

  const refreshAll = () => {
    refetchApps();
    refetchMessages();
    refetchDonors();
    setLastUpdated(new Date());
    toast.success("Data refreshed");
  };

  const exportCSV = () => {
    if (!applications) return;
    const headers = ["Name", "Email", "Program", "Amount", "Status", "Date"];
    const rows = applications.map((a: any) => [
      `${a.firstName} ${a.lastName}`, a.email, a.programInterest,
      `$${a.amountRequested}`, a.status, new Date(a.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "applications.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Filter applications
  const filteredApps = useMemo(() => {
    if (!applications) return [];
    let filtered = [...applications] as Application[];
    if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.programInterest.toLowerCase().includes(q)
      );
    }
    // Auto-rank by overall score (highest first)
    filtered.sort((a, b) => {
      const scoreA = a.overallScore ?? -1;
      const scoreB = b.overallScore ?? -1;
      return scoreB - scoreA;
    });
    return filtered;
  }, [applications, statusFilter, searchQuery]);

  const unreadCount = messagesData?.filter((m: any) => !m.isRead && !m.isArchived).length || 0;

  // ─── Login Screen ───────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F5F2" }}>
        <Card className="max-w-md w-full mx-4 border-gray-200 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "#4A6FA5" }}>
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-serif font-bold" style={{ color: "#1C2127" }}>Committee Portal</h1>
              <p className="text-sm mt-2" style={{ color: "#6B6B6B" }}>Enter the committee password to access the review dashboard</p>
            </div>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="border-gray-300"
              />
              <Button
                className="w-full text-white"
                style={{ background: "#4A6FA5" }}
                onClick={handleLogin}
                disabled={validateMutation.isPending}
              >
                {validateMutation.isPending ? "Verifying..." : "Access Dashboard"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Identity Dialog (inline to prevent remount/focus loss) ─────────────────

  const identityDialog = (
    <Dialog open={showIdentityDialog} onOpenChange={setShowIdentityDialog}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif">Welcome to the Committee Portal</DialogTitle>
        </DialogHeader>
        <p className="text-sm" style={{ color: "#6B6B6B" }}>Please enter your name and email so reviews can be attributed to you.</p>
        <div className="space-y-3 mt-2">
          <Input placeholder="Your name" value={identityName} onChange={(e) => setIdentityName(e.target.value)} />
          <Input placeholder="Your email" type="email" value={identityEmail} onChange={(e) => setIdentityEmail(e.target.value)} />
          <Button className="w-full text-white" style={{ background: "#4A6FA5" }} onClick={handleIdentitySave}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ─── Status Badge Helper ────────────────────────────────────────────────────

  const statusBadge = (status: string, score?: number | null) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-700",
      under_review: "bg-blue-100 text-blue-700",
      shortlisted: "bg-green-100 text-green-700",
      approved: "bg-emerald-100 text-emerald-700",
      denied: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      pending: "Pending",
      under_review: "Under Review",
      shortlisted: "Shortlisted",
      approved: "Approved",
      denied: "Denied",
    };
    return (
      <span className="inline-flex items-center gap-1.5">
        <Badge className={`${colors[status] || colors.pending} hover:${colors[status] || colors.pending}`}>
          {labels[status] || status}
        </Badge>
        {score !== null && score !== undefined && (
          <span className="text-xs font-medium" style={{ color: "#4A6FA5" }}>{score}/100</span>
        )}
      </span>
    );
  };

  // ─── Application Detail Dialog ──────────────────────────────────────────────

  const ApplicationDetailDialog = () => {
    const [detailTab, setDetailTab] = useState("overview");
    const [reviewScore, setReviewScore] = useState("");
    const [reviewNotes, setReviewNotes] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [overallScoreInput, setOverallScoreInput] = useState("");
    const [committeeNotesInput, setCommitteeNotesInput] = useState("");

    useEffect(() => {
      if (appDetail) {
        setOverallScoreInput(appDetail.overallScore?.toString() || "");
        setCommitteeNotesInput(appDetail.committeeNotes || "");
      }
    }, [appDetail]);

    if (!appDetail) return null;

    const aiData = appDetail.aiAnalysis ? (() => {
      try { return JSON.parse(appDetail.aiAnalysis); } catch { return null; }
    })() : null;

    return (
      <Dialog open={!!selectedAppId} onOpenChange={() => setSelectedAppId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-3">
              {appDetail.firstName} {appDetail.lastName}
              {statusBadge(appDetail.status, appDetail.avgScore)}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={detailTab} onValueChange={setDetailTab}>
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="essay">Essay</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="ai">AI Analysis</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Scholarship type badge */}
              <div className="flex items-center gap-2 mb-2">
                <Badge className={(appDetail as any).scholarshipType === "merit_jhsc" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : "bg-teal-100 text-teal-700 hover:bg-teal-100"}>
                  {(appDetail as any).scholarshipType === "merit_jhsc" ? "JHSC Merit Scholarship" : "Need-Based Scholarship"}
                </Badge>
                {(appDetail as any).division && (
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                    {(appDetail as any).division === "high_school" ? "High School" : "Middle School"}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Email", value: appDetail.email },
                  { label: "Phone", value: appDetail.phone || (appDetail as any).parentPhone || "N/A" },
                  { label: "Grade Level", value: (appDetail as any).gradeLevel || "N/A" },
                  { label: "Current School", value: (appDetail as any).currentSchool || "N/A" },
                  { label: "Parent/Guardian", value: (appDetail as any).parentName || "N/A" },
                  { label: "Parent Email", value: (appDetail as any).parentEmail || "N/A" },
                  { label: "Scholarship Type", value: (appDetail as any).scholarshipType === "merit_jhsc" ? "JHSC Merit" : "Need-Based" },
                  { label: "Submitted", value: new Date(appDetail.createdAt).toLocaleDateString() },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
                    <p className="text-xs" style={{ color: "#8B7D6B" }}>{item.label}</p>
                    <p className="text-sm font-medium" style={{ color: "#1C2127" }}>{item.value}</p>
                  </div>
                ))}
              </div>
              {/* Need-based financial info */}
              {(appDetail as any).scholarshipType === "need_based" && (appDetail as any).householdIncome && (
                <div className="p-3 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
                  <p className="text-xs mb-1" style={{ color: "#8B7D6B" }}>Financial Information</p>
                  <p className="text-sm" style={{ color: "#1C2127" }}>
                    Household Income: {(appDetail as any).householdIncome} | Size: {(appDetail as any).householdSize || "N/A"} | MFI: {(appDetail as any).mfiPercentage === "100_120" ? "100-120%" : (appDetail as any).mfiPercentage === "below_100" ? "Below 100%" : "Not sure"}
                  </p>
                </div>
              )}
              {/* Merit JHSC info */}
              {(appDetail as any).scholarshipType === "merit_jhsc" && (
                <div className="p-3 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
                  <p className="text-xs mb-1" style={{ color: "#8B7D6B" }}>JHSC Membership</p>
                  <p className="text-sm" style={{ color: "#1C2127" }}>
                    Active JHSC Member: {(appDetail as any).activeJhscMember ? "Yes" : "No"}
                  </p>
                </div>
              )}
              {appDetail.address && (
                <div className="p-3 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
                  <p className="text-xs" style={{ color: "#8B7D6B" }}>Address</p>
                  <p className="text-sm" style={{ color: "#1C2127" }}>
                    {appDetail.address}{appDetail.city ? `, ${appDetail.city}` : ""}{appDetail.state ? `, ${appDetail.state}` : ""} {appDetail.zipCode || ""}
                  </p>
                </div>
              )}
              {appDetail.financialStatement && (
                <div className="p-3 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
                  <p className="text-xs mb-1" style={{ color: "#8B7D6B" }}>Financial Statement</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "#3D3D3D" }}>{appDetail.financialStatement}</p>
                </div>
              )}
              {/* Referrals */}
              {appDetail.referrals && appDetail.referrals.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: "#1C2127" }}>Referrals</h4>
                  <div className="space-y-2">
                    {appDetail.referrals.map((ref: any) => (
                      <div key={ref.id} className="p-3 rounded border border-gray-200 flex items-center justify-between" style={{ background: "#FAFAF8" }}>
                        <div>
                          <p className="text-sm font-medium">{ref.referrerName}</p>
                          <p className="text-xs" style={{ color: "#6B6B6B" }}>{ref.referrerEmail} &middot; {ref.relationship}</p>
                        </div>
                        <Users className="h-4 w-4" style={{ color: "#8B7D6B" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Essay Tab */}
            <TabsContent value="essay" className="mt-4 space-y-4">
              {[appDetail.essay, (appDetail as any).essay2, (appDetail as any).essay3, (appDetail as any).essay4].map((essayText, i) => (
                essayText && (
                  <div key={i} className="p-4 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
                    <p className="text-xs font-medium mb-2" style={{ color: "#8B7D6B" }}>Essay {i + 1}</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "#3D3D3D" }}>{essayText}</p>
                  </div>
                )
              ))}
              {(appDetail as any).parentStatement && (
                <div className="p-4 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
                  <p className="text-xs font-medium mb-2" style={{ color: "#8B7D6B" }}>Parent/Guardian Statement</p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "#3D3D3D" }}>{(appDetail as any).parentStatement}</p>
                </div>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-4 space-y-4">
              {appDetail.files && appDetail.files.length > 0 ? (
                <div className="space-y-2">
                  {appDetail.files.map((file: any) => (
                    <div key={file.id} className="p-3 rounded border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" style={{ color: "#4A6FA5" }} />
                        <div>
                          <p className="text-sm font-medium">{file.filename}</p>
                          <p className="text-xs" style={{ color: "#6B6B6B" }}>{file.category} &middot; {file.uploaderName || "Unknown"}</p>
                        </div>
                      </div>
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost"><ExternalLink className="h-3 w-3" /></Button>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-8" style={{ color: "#8B7D6B" }}>No documents uploaded yet.</p>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-4 space-y-4">
              {/* Rubric-based review form */}
              <RubricReviewForm
                scholarshipType={(appDetail as any).scholarshipType || "need_based"}
                applicationId={selectedAppId!}
                identity={identity}
                addReviewMutation={addReviewMutation}
              />

              {/* Existing reviews */}
              {appDetail.reviews && appDetail.reviews.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium" style={{ color: "#1C2127" }}>All Reviews ({appDetail.reviews.length})</h4>
                  {appDetail.reviews.map((review: any) => {
                    const isOwnReview = identity && review.reviewerEmail === identity.email;
                    const rubric = review.rubricScores ? (() => { try { return JSON.parse(review.rubricScores); } catch { return null; } })() : null;
                    return (
                      <div key={review.id} className={`p-4 rounded border ${isOwnReview ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: isOwnReview ? "#2563eb" : "#4A6FA5" }}>
                            {review.reviewerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{review.reviewerName}</span>
                              {isOwnReview && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">You</Badge>}
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Total: {review.score}/30</Badge>
                            </div>
                            {/* Show detailed rubric only for own reviews */}
                            {isOwnReview && rubric && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                {Object.entries(rubric).map(([cat, score]) => (
                                  <div key={cat} className="text-xs p-1.5 rounded bg-gray-50 border">
                                    <span style={{ color: "#8B7D6B" }}>{cat}:</span>{" "}
                                    <span className="font-semibold">{score as number}/5</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* For others' reviews, just show total */}
                            {!isOwnReview && (
                              <p className="text-xs mt-1" style={{ color: "#8B7D6B" }}>Detailed rubric scores visible only to reviewer</p>
                            )}
                            {isOwnReview && review.notes && <p className="text-sm mt-2" style={{ color: "#3D3D3D" }}>{review.notes}</p>}
                            <p className="text-xs mt-1" style={{ color: "#8B7D6B" }}>{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: "#8B7D6B" }}>No reviews yet. Be the first to review!</p>
              )}

              <Separator />

              {/* Status & Score Update */}
              <div className="p-4 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
                <h4 className="text-sm font-medium mb-3">Status & Score</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs" style={{ color: "#8B7D6B" }}>Overall Score</label>
                    <Input type="number" min="0" max="100" value={overallScoreInput} onChange={(e) => setOverallScoreInput(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: "#8B7D6B" }}>Status</label>
                    <Select value={appDetail.status} onValueChange={(val) => updateStatusMutation.mutate({ id: selectedAppId!, status: val as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs" style={{ color: "#8B7D6B" }}>Committee Notes</label>
                  <Textarea value={committeeNotesInput} onChange={(e) => setCommitteeNotesInput(e.target.value)} rows={2} />
                </div>
                <Button
                  size="sm"
                  className="text-white"
                  style={{ background: "#4A6FA5" }}
                  onClick={() => updateScoreMutation.mutate({
                    id: selectedAppId!,
                    score: overallScoreInput ? parseInt(overallScoreInput) : null,
                    notes: committeeNotesInput || undefined,
                  })}
                >
                  Save
                </Button>
              </div>
            </TabsContent>

            {/* AI Analysis Tab */}
            <TabsContent value="ai" className="mt-4">
              {aiData ? (
                <div className="space-y-4">
                  <div className="p-4 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
                    <p className="text-sm leading-relaxed" style={{ color: "#3D3D3D" }}>{aiData.summary}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      aiData.recommendation === "Strong Candidate" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                      aiData.recommendation === "Weak Candidate" ? "bg-red-100 text-red-700 hover:bg-red-100" :
                      "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                    }>
                      {aiData.recommendation}
                    </Badge>
                    <span className="text-sm font-medium" style={{ color: "#4A6FA5" }}>Suggested Score: {aiData.recommendedScore}/100</span>
                  </div>
                  {aiData.keyPoints && aiData.keyPoints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Points</h4>
                      <ul className="space-y-1">
                        {aiData.keyPoints.map((p: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2" style={{ color: "#3D3D3D" }}>
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#4A6FA5" }} />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {aiData.strengths && aiData.strengths.length > 0 && (
                      <div className="p-3 rounded border border-green-200 bg-green-50">
                        <h5 className="text-xs font-medium text-green-700 mb-2">Strengths</h5>
                        <ul className="space-y-1">
                          {aiData.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-xs text-green-800 flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiData.weaknesses && aiData.weaknesses.length > 0 && (
                      <div className="p-3 rounded border border-red-200 bg-red-50">
                        <h5 className="text-xs font-medium text-red-700 mb-2">Areas of Concern</h5>
                        <ul className="space-y-1">
                          {aiData.weaknesses.map((w: string, i: number) => (
                            <li key={i} className="text-xs text-red-800 flex items-start gap-1">
                              <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => aiAnalyzeMutation.mutate({ id: selectedAppId! })} disabled={aiAnalyzeMutation.isPending}>
                    {aiAnalyzeMutation.isPending ? "Regenerating..." : "Regenerate"}
                  </Button>
                  {appDetail.aiAnalysisGeneratedAt && (
                    <p className="text-xs" style={{ color: "#8B7D6B" }}>Generated: {new Date(appDetail.aiAnalysisGeneratedAt).toLocaleString()}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: "#D4A574" }} />
                  <h4 className="font-medium mb-2" style={{ color: "#1C2127" }}>AI-Powered Analysis</h4>
                  <p className="text-sm mb-4" style={{ color: "#6B6B6B" }}>Generate an AI analysis of this application including strengths, concerns, and a recommended score.</p>
                  <Button
                    className="text-white"
                    style={{ background: "#4A6FA5" }}
                    onClick={() => aiAnalyzeMutation.mutate({ id: selectedAppId! })}
                    disabled={aiAnalyzeMutation.isPending}
                  >
                    {aiAnalyzeMutation.isPending ? "Generating..." : "Generate Analysis"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  // ─── Main Dashboard ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: "#F7F5F2" }}>
      {identityDialog}
      <ApplicationDetailDialog />

      {/* Header */}
      <div className="border-b" style={{ background: "#1C2127" }}>
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: "#D4A574" }}>Committee Portal</p>
              <h1 className="text-xl font-serif font-bold text-white">Review Dashboard</h1>
              {identity && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Reviewing as <span className="text-white">{identity.name}</span>
                  <button className="ml-2 underline" style={{ color: "#D4A574" }} onClick={() => setShowIdentityDialog(true)}>change</button>
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400" onClick={exportCSV}>
              <Download className="h-3 w-3 mr-1" /> Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b bg-white">
        <div className="container">
          <div className="flex gap-0">
            {[
              { id: "applications", label: "Applications", icon: FileText },
              { id: "messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
              { id: "donors", label: "Donors", icon: DollarSign },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#4A6FA5] text-[#4A6FA5]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.badge ? (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-700">{tab.badge}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="container mt-4 flex items-center justify-end gap-3">
        <div className="flex items-center gap-2 text-xs" style={{ color: "#8B7D6B" }}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
        <button onClick={refreshAll} className="text-xs flex items-center gap-1 hover:underline" style={{ color: "#4A6FA5" }}>
          <RefreshCw className="h-3 w-3" /> Refresh now
        </button>
      </div>

      {/* Content */}
      <div className="container py-6">
        {/* ─── Applications Tab ──────────────────────────────────────────── */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total", value: appStats?.total || 0, color: "#4A6FA5", filter: null },
                { label: "Pending", value: appStats?.pending || 0, color: "#6B6B6B", filter: "pending" },
                { label: "Under Review", value: appStats?.under_review || 0, color: "#2563EB", filter: "under_review" },
                { label: "Shortlisted", value: appStats?.shortlisted || 0, color: "#059669", filter: "shortlisted" },
              ].map(stat => (
                <Card
                  key={stat.label}
                  className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === stat.filter ? "ring-2 ring-[#4A6FA5]" : ""}`}
                  onClick={() => setStatusFilter(statusFilter === stat.filter ? null : stat.filter)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: "#8B7D6B" }}>{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3 items-center">
                  <Input
                    placeholder="Search by name, email, or program..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  {(searchQuery || statusFilter) && (
                    <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setStatusFilter(null); }}>
                      Clear all
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Applications table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b" style={{ background: "#FAFAF8" }}>
                      <tr>
                        <th className="text-left p-4 font-medium" style={{ color: "#1C2127" }}>Applicant</th>
                        <th className="text-left p-4 font-medium" style={{ color: "#1C2127" }}>Program</th>
                        <th className="text-left p-4 font-medium" style={{ color: "#1C2127" }}>Amount</th>
                        <th className="text-left p-4 font-medium" style={{ color: "#1C2127" }}>Submitted</th>
                        <th className="text-left p-4 font-medium" style={{ color: "#1C2127" }}>Status</th>
                        <th className="text-left p-4 font-medium" style={{ color: "#1C2127" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.length > 0 ? filteredApps.map((app) => (
                        <tr key={app.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <p className="font-medium" style={{ color: "#1C2127" }}>{app.firstName} {app.lastName}</p>
                            <p className="text-xs" style={{ color: "#6B6B6B" }}>{app.email}</p>
                          </td>
                          <td className="p-4" style={{ color: "#3D3D3D" }}>{app.programInterest}</td>
                          <td className="p-4 font-semibold" style={{ color: "#1C2127" }}>${app.amountRequested}</td>
                          <td className="p-4" style={{ color: "#6B6B6B" }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">{statusBadge(app.status, app.overallScore)}</td>
                          <td className="p-4">
                            <Button size="sm" variant="outline" onClick={() => setSelectedAppId(app.id)} style={{ color: "#4A6FA5", borderColor: "#4A6FA5" }}>
                              Review
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center" style={{ color: "#8B7D6B" }}>
                            {applications?.length === 0 ? "No applications yet." : "No applications match your filters."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Messages Tab ──────────────────────────────────────────────── */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Inbox", value: messageStats?.total || 0, icon: Mail },
                { label: "Unread", value: messageStats?.unread || 0, icon: MailOpen },
                { label: "Read", value: messageStats?.read || 0, icon: CheckCircle },
                { label: "Archived", value: messageStats?.archived || 0, icon: Archive },
              ].map(stat => (
                <Card key={stat.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <stat.icon className="h-5 w-5" style={{ color: "#4A6FA5" }} />
                    <div>
                      <p className="text-xl font-bold" style={{ color: "#1C2127" }}>{stat.value}</p>
                      <p className="text-xs" style={{ color: "#8B7D6B" }}>{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-0 divide-y">
                {messagesData && messagesData.length > 0 ? messagesData.filter((m: any) => !m.isArchived).map((m: any) => (
                  <MessageRow key={m.id} message={m} onMarkRead={() => markReadMutation.mutate({ id: m.id })} onArchive={() => archiveMessageMutation.mutate({ id: m.id })} onDelete={() => deleteMessageMutation.mutate({ id: m.id })} />
                )) : (
                  <div className="p-8 text-center" style={{ color: "#8B7D6B" }}>No messages yet.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Donors Tab ────────────────────────────────────────────────── */}
        {activeTab === "donors" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Donors", value: donorStats?.total || 0 },
                { label: "Pending Thank You", value: donorStats?.pendingThankYou || 0 },
                { label: "Thank You Sent", value: donorStats?.thankYouSent || 0 },
              ].map(stat => (
                <Card key={stat.label}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" style={{ color: "#1C2127" }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: "#8B7D6B" }}>{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b" style={{ background: "#FAFAF8" }}>
                      <tr>
                        <th className="text-left p-4 font-medium">Donor</th>
                        <th className="text-left p-4 font-medium">Amount</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donorsData && donorsData.length > 0 ? donorsData.filter((d: any) => d.status === "completed").map((d: any) => (
                        <tr key={d.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <p className="font-medium" style={{ color: "#1C2127" }}>{d.firstName} {d.lastName}</p>
                            <p className="text-xs" style={{ color: "#6B6B6B" }}>{d.email}</p>
                            {d.note && <p className="text-xs italic mt-1" style={{ color: "#8B7D6B" }}>"{d.note}"</p>}
                          </td>
                          <td className="p-4">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              ${d.amount} {d.frequency === "monthly" && <span className="ml-1">/mo</span>}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {d.thankYouSent ? (
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Thank You Sent</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
                            )}
                          </td>
                          <td className="p-4" style={{ color: "#6B6B6B" }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              {!d.thankYouSent && (
                                <Button size="sm" variant="ghost" onClick={() => markThankYouMutation.mutate({ id: d.id })} title="Mark Thank You Sent">
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { if (confirm("Delete this donation record?")) deleteDonorMutation.mutate({ id: d.id }); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="p-8 text-center" style={{ color: "#8B7D6B" }}>No donations yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Analytics Tab ─────────────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <AnalyticsTab
            appStats={appStats}
            applications={applications as Application[] || []}
            fundraisingData={fundraisingData}
            accessTokens={accessTokens || []}
            onUpdateFundraising={(data) => updateFundraisingMutation.mutate(data)}
            onCreateToken={(label) => createTokenMutation.mutate({ label })}
            onRevokeToken={(id) => revokeTokenMutation.mutate({ id })}
          />
        )}
      </div>
    </div>
  );
}

// ─── Message Row Component ──────────────────────────────────────────────────

function MessageRow({ message, onMarkRead, onArchive, onDelete }: { message: any; onMarkRead: () => void; onArchive: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!message.isRead && !expanded) onMarkRead();
  };

  return (
    <div className="hover:bg-gray-50 transition-colors">
      <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={handleExpand}>
        {message.isRead ? (
          <MailOpen className="h-4 w-4 flex-shrink-0" style={{ color: "#8B7D6B" }} />
        ) : (
          <Mail className="h-4 w-4 flex-shrink-0" style={{ color: "#4A6FA5" }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${!message.isRead ? "font-bold" : "font-medium"}`} style={{ color: "#1C2127" }}>
              {message.firstName} {message.lastName}
            </span>
            <span className="text-xs" style={{ color: "#8B7D6B" }}>{message.subject}</span>
          </div>
          <p className="text-xs truncate" style={{ color: "#6B6B6B" }}>{message.message}</p>
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: "#8B7D6B" }}>{new Date(message.createdAt).toLocaleDateString()}</span>
      </div>
      {expanded && (
        <div className="px-4 pb-4 ml-7 border-l-2" style={{ borderColor: "#4A6FA5" }}>
          <div className="p-4 rounded" style={{ background: "#FAFAF8" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">{message.firstName} {message.lastName}</span>
              <a href={`mailto:${message.email}`} className="text-xs underline" style={{ color: "#4A6FA5" }}>{message.email}</a>
            </div>
            <p className="text-xs font-medium mb-2" style={{ color: "#1C2127" }}>{message.subject}</p>
            <p className="text-sm whitespace-pre-wrap" style={{ color: "#3D3D3D" }}>{message.message}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${message.email}?subject=Re: ${message.subject}`)}>
                <Mail className="h-3 w-3 mr-1" /> Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={onArchive}>
                <Archive className="h-3 w-3 mr-1" /> Archive
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { if (confirm("Delete this message?")) onDelete(); }}>
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Tab Component ────────────────────────────────────────────────

function AnalyticsTab({ appStats, applications, fundraisingData, accessTokens, onUpdateFundraising, onCreateToken, onRevokeToken }: {
  appStats: any;
  applications: Application[];
  fundraisingData: any;
  accessTokens: any[];
  onUpdateFundraising: (data: any) => void;
  onCreateToken: (label: string) => void;
  onRevokeToken: (id: number) => void;
}) {
  const [goalAmount, setGoalAmount] = useState(fundraisingData?.goalAmount || "50000");
  const [currentAmount, setCurrentAmount] = useState(fundraisingData?.currentAmount || "0");
  const [campaignTitle, setCampaignTitle] = useState(fundraisingData?.campaignTitle || "Scholarship Fund");
  const [campaignDesc, setCampaignDesc] = useState(fundraisingData?.description || "");
  const [tokenLabel, setTokenLabel] = useState("");

  useEffect(() => {
    if (fundraisingData) {
      setGoalAmount(fundraisingData.goalAmount || "50000");
      setCurrentAmount(fundraisingData.currentAmount || "0");
      setCampaignTitle(fundraisingData.campaignTitle || "Scholarship Fund");
      setCampaignDesc(fundraisingData.description || "");
    }
  }, [fundraisingData]);

  // Program distribution
  const programCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => { counts[a.programInterest] = (counts[a.programInterest] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* Application Overview */}
      <Card>
        <CardHeader><CardTitle className="font-serif text-base">Application Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "Total", value: appStats?.total || 0, color: "#4A6FA5" },
              { label: "Pending", value: appStats?.pending || 0, color: "#6B6B6B" },
              { label: "Under Review", value: appStats?.under_review || 0, color: "#2563EB" },
              { label: "Shortlisted", value: appStats?.shortlisted || 0, color: "#059669" },
              { label: "Approved", value: appStats?.approved || 0, color: "#047857" },
              { label: "Denied", value: appStats?.denied || 0, color: "#DC2626" },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded" style={{ background: "#FAFAF8" }}>
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs" style={{ color: "#8B7D6B" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Program Distribution */}
      {programCounts.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="font-serif text-base">By Program</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {programCounts.map(([program, count]) => (
                <div key={program} className="flex items-center gap-3">
                  <span className="text-sm flex-1" style={{ color: "#3D3D3D" }}>{program}</span>
                  <div className="w-32 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / (appStats?.total || 1)) * 100}%`, background: "#4A6FA5" }} />
                  </div>
                  <span className="text-sm font-medium w-8 text-right" style={{ color: "#1C2127" }}>{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fundraising Settings */}
      <Card>
        <CardHeader><CardTitle className="font-serif text-base">Fundraising Thermometer Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs" style={{ color: "#8B7D6B" }}>Goal Amount ($)</label>
              <Input value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-xs" style={{ color: "#8B7D6B" }}>Current Amount Raised ($)</label>
              <Input value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs" style={{ color: "#8B7D6B" }}>Campaign Title</label>
            <Input value={campaignTitle} onChange={(e) => setCampaignTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs" style={{ color: "#8B7D6B" }}>Description (optional)</label>
            <Textarea value={campaignDesc} onChange={(e) => setCampaignDesc(e.target.value)} rows={2} />
          </div>
          <Button
            size="sm"
            className="text-white"
            style={{ background: "#4A6FA5" }}
            onClick={() => onUpdateFundraising({ goalAmount, currentAmount, campaignTitle, description: campaignDesc || undefined })}
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Access Links */}
      <Card>
        <CardHeader><CardTitle className="font-serif text-base">Access Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input placeholder="Label (e.g. Rebecca's Link)" value={tokenLabel} onChange={(e) => setTokenLabel(e.target.value)} />
            <Button
              size="sm"
              className="text-white flex-shrink-0"
              style={{ background: "#4A6FA5" }}
              disabled={!tokenLabel.trim()}
              onClick={() => { onCreateToken(tokenLabel.trim()); setTokenLabel(""); }}
            >
              <Link2 className="h-3 w-3 mr-1" /> Generate Link
            </Button>
          </div>
          <p className="text-xs" style={{ color: "#8B7D6B" }}>Generated links are copied to clipboard automatically. They cannot be viewed again after creation.</p>
          {accessTokens && accessTokens.length > 0 && (
            <div className="space-y-2 mt-4">
              {accessTokens.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#1C2127" }}>{t.label}</p>
                    <p className="text-xs" style={{ color: "#8B7D6B" }}>
                      Created: {new Date(t.createdAt).toLocaleDateString()}
                      {t.lastUsed && ` · Last used: ${new Date(t.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                  {t.isActive ? (
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => onRevokeToken(t.id)}>Revoke</Button>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100">Revoked</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


// ─── Rubric Review Form ─────────────────────────────────────────────────────

const NEED_BASED_RUBRIC = [
  { key: "Financial Need", description: "Scholarship would substantially increase access to RadAcad" },
  { key: "RadAcad Fit", description: "Understanding and alignment with RadAcad's mission" },
  { key: "RadAcad Values", description: "Ownership, curiosity, integrity, responsibility, collaboration" },
  { key: "Goals & Motivation", description: "Clear, ambitious, realistic goals with rationale" },
  { key: "Community Contribution", description: "Leadership, kindness, collaboration, positive impact" },
  { key: "Communication", description: "Organized, thoughtful, well-written" },
];

const MERIT_RUBRIC = [
  { key: "RadAcad Fit", description: "Alignment between RadAcad values, learning model, and student goals" },
  { key: "RadAcad Values", description: "Ownership, curiosity, integrity, collaboration, responsibility" },
  { key: "JHSC Values", description: "Commitment, teamwork, sportsmanship, fun, competitive integrity" },
  { key: "Academic & Athletic Goals", description: "Realistic, aligned goals showing motivation and clarity" },
  { key: "Communication", description: "Clarity, grammar, structure, effort" },
  { key: "Rec. Letters", description: "Strength, relevance, and detail of recommendations" },
];

function RubricReviewForm({ scholarshipType, applicationId, identity, addReviewMutation }: {
  scholarshipType: string;
  applicationId: number;
  identity: CommitteeIdentity | null;
  addReviewMutation: any;
}) {
  const rubric = scholarshipType === "merit_jhsc" ? MERIT_RUBRIC : NEED_BASED_RUBRIC;
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const updateScore = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const maxScore = rubric.length * 5;
  const allScored = rubric.every(r => scores[r.key] && scores[r.key] >= 1);

  const handleSubmit = () => {
    if (!allScored) {
      toast.error("Please score all rubric categories before submitting.");
      return;
    }
    addReviewMutation.mutate({
      applicationId,
      reviewerName: identity?.name || "Committee Member",
      reviewerEmail: identity?.email,
      score: totalScore,
      rubricScores: JSON.stringify(scores),
      notes: notes || undefined,
    });
    setScores({});
    setNotes("");
  };

  return (
    <div className="p-4 rounded border border-gray-200" style={{ background: "#FAFAF8" }}>
      <h4 className="text-sm font-medium mb-1">Score This Application</h4>
      <p className="text-xs mb-4" style={{ color: "#8B7D6B" }}>
        {scholarshipType === "merit_jhsc" ? "JHSC Merit Scholarship Rubric" : "Need-Based Scholarship Rubric"} — Rate each category 1-5
      </p>
      <div className="space-y-3">
        {rubric.map((category) => (
          <div key={category.key} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" title={category.key}>{category.key}</p>
              <p className="text-xs truncate" style={{ color: "#8B7D6B" }} title={category.description}>{category.description}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => updateScore(category.key, n)}
                  className={`w-7 h-7 text-xs font-bold rounded border transition-all ${
                    scores[category.key] === n
                      ? "bg-[#4A6FA5] text-white border-[#4A6FA5]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#4A6FA5]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Total Score:</span>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{totalScore}/{maxScore}</Badge>
        </div>
        <div className="mb-3">
          <label className="text-xs" style={{ color: "#8B7D6B" }}>Notes (optional)</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional comments..." rows={2} />
        </div>
        <Button
          size="sm"
          className="text-white"
          style={{ background: "#4A6FA5" }}
          disabled={!allScored || addReviewMutation.isPending}
          onClick={handleSubmit}
        >
          Submit Rubric Review
        </Button>
      </div>
    </div>
  );
}
