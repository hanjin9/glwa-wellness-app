import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertCircle, TrendingUp, MessageSquare, Calendar, User } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  health_analysis: "건강 분석",
  exercise: "운동",
  nutrition: "영양",
  mental: "정신 건강",
  lifestyle: "생활 습관",
  motivation: "동기부여",
  general: "일반",
};

const CATEGORY_COLORS: Record<string, string> = {
  health_analysis: "bg-blue-100 text-blue-800",
  exercise: "bg-green-100 text-green-800",
  nutrition: "bg-orange-100 text-orange-800",
  mental: "bg-purple-100 text-purple-800",
  lifestyle: "bg-pink-100 text-pink-800",
  motivation: "bg-yellow-100 text-yellow-800",
  general: "bg-gray-100 text-gray-800",
};

const RISK_LEVEL_COLORS: Record<string, string> = {
  normal: "bg-green-50 border-green-200",
  caution: "bg-yellow-50 border-yellow-200",
  warning: "bg-red-50 border-red-200",
};

const RISK_LEVEL_LABELS: Record<string, string> = {
  normal: "정상",
  caution: "주의",
  warning: "경고",
};

export function Coaching() {
  const { user, loading } = useAuth();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterReadStatus, setFilterReadStatus] = useState<"all" | "unread" | "read">("all");

  const coachingQuery = trpc.coaching.getMyCoaching.useQuery(
    { limit: 100 },
    { enabled: !!user && !loading }
  );

  const analysesQuery = trpc.coaching.getMyAnalyses.useQuery(
    { limit: 10 },
    { enabled: !!user && !loading }
  );

  const markRead = trpc.coaching.markRead.useMutation({
    onSuccess: () => {
      coachingQuery.refetch();
      toast.success("읽음 처리 완료");
    },
    onError: () => {
      toast.error("읽음 처리 실패");
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>로그인 필요</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">코칭 메시지를 보려면 로그인해주세요.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const coachingMessages = coachingQuery.data || [];
  const analyses = analysesQuery.data || [];

  // 필터링
  const filteredCoaching = coachingMessages.filter((msg: any) => {
    const categoryMatch = filterCategory === "all" || msg.category === filterCategory;
    const readStatusMatch =
      filterReadStatus === "all" ||
      (filterReadStatus === "unread" && !msg.isRead) ||
      (filterReadStatus === "read" && msg.isRead);
    return categoryMatch && readStatusMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">나의 코칭</h1>
          <p className="text-gray-600">AI 분석 결과와 전담 코치의 맞춤 코칭을 한 곳에서 확인하세요</p>
        </div>

        {/* 탭 */}
        <Tabs defaultValue="coaching" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="coaching">
              <MessageSquare className="w-4 h-4 mr-2" />
              코칭 메시지 ({filteredCoaching.length})
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <TrendingUp className="w-4 h-4 mr-2" />
              AI 분석 ({analyses.length})
            </TabsTrigger>
          </TabsList>

          {/* 코칭 메시지 탭 */}
          <TabsContent value="coaching" className="space-y-4">
            {/* 필터 */}
            <div className="flex gap-2 flex-wrap mb-6">
              <Button
                variant={filterCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory("all")}
              >
                전체
              </Button>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  variant={filterCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterCategory(key)}
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              <Button
                variant={filterReadStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterReadStatus("all")}
              >
                전체
              </Button>
              <Button
                variant={filterReadStatus === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterReadStatus("unread")}
              >
                안 읽음
              </Button>
              <Button
                variant={filterReadStatus === "read" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterReadStatus("read")}
              >
                읽음
              </Button>
            </div>

            {/* 코칭 메시지 리스트 */}
            {filteredCoaching.length === 0 ? (
              <Card className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">코칭 메시지가 없습니다</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCoaching.map((msg: any) => (
                  <Card
                    key={msg.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      msg.isRead ? "opacity-75" : "border-l-4 border-l-primary"
                    }`}
                    onClick={() => {
                      if (!msg.isRead) {
                        markRead.mutate({ id: msg.id });
                      }
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={CATEGORY_COLORS[msg.category]}>
                              {CATEGORY_LABELS[msg.category]}
                            </Badge>
                            {msg.isRead ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <CardTitle className="text-lg">{msg.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                        <div className="flex items-center gap-4">
                          {msg.createdBy && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{msg.createdBy}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(msg.createdAt).toLocaleDateString("ko-KR")}</span>
                          </div>
                        </div>
                        {msg.sentAt && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            발송됨
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI 분석 탭 */}
          <TabsContent value="analysis" className="space-y-4">
            {analyses.length === 0 ? (
              <Card className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">AI 분석 결과가 없습니다</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis: any) => (
                  <Card
                    key={analysis.id}
                    className={`border-2 ${RISK_LEVEL_COLORS[analysis.riskLevel] || RISK_LEVEL_COLORS.normal}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                analysis.riskLevel === "warning"
                                  ? "destructive"
                                  : analysis.riskLevel === "caution"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {RISK_LEVEL_LABELS[analysis.riskLevel] || "정상"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {analysis.analysisType || "일일 분석"}
                            </span>
                          </div>
                          <CardTitle className="text-lg">건강 분석 결과</CardTitle>
                        </div>
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-1">분석 내용</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{analysis.analysisResult}</p>
                      </div>

                      {analysis.recommendations && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-1">추천사항</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{analysis.recommendations}</p>
                        </div>
                      )}

                      {analysis.adminNotes && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm font-semibold text-blue-900 mb-1">관리자 메모</p>
                          <p className="text-blue-800 whitespace-pre-wrap">{analysis.adminNotes}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 pt-2 border-t">
                        분석 일시: {new Date(analysis.createdAt).toLocaleString("ko-KR")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Coaching;
