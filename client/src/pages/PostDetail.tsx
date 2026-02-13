import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, MessageSquare, Eye, Send, User, Clock } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const CATEGORY_MAP: Record<string, string> = {
  free: "자유게시판", health_tip: "건강 팁", exercise: "운동",
  nutrition: "영양", question: "질문", success_story: "성공 스토리",
};

export default function PostDetail() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const postId = parseInt(params.id || "0");
  const [comment, setComment] = useState("");
  const utils = trpc.useUtils();

  const { data: post, isLoading } = trpc.community.getPost.useQuery({ postId });
  const { data: comments } = trpc.community.getComments.useQuery({ postId });
  const { data: isLiked } = trpc.community.isLiked.useQuery({ postId }, { enabled: isAuthenticated });

  const toggleLike = trpc.community.toggleLike.useMutation({
    onSuccess: () => {
      utils.community.getPost.invalidate({ postId });
      utils.community.isLiked.invalidate({ postId });
    },
  });

  const createComment = trpc.community.createComment.useMutation({
    onSuccess: () => {
      utils.community.getComments.invalidate({ postId });
      utils.community.getPost.invalidate({ postId });
      setComment("");
      toast.success("댓글이 작성되었습니다");
    },
  });

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">게시글을 찾을 수 없습니다</p>
        <Button onClick={() => navigate("/community")}>돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white border-b px-4 pt-12 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/community")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Badge variant="outline">{CATEGORY_MAP[post.category] || post.category}</Badge>
      </div>

      {/* Post Content */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <p className="font-medium text-sm">{post.authorName || "익명"}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTime(post.createdAt)}
            </p>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-4">{post.title}</h1>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {/* Stats & Actions */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t">
          <button
            className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
            onClick={() => {
              if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
              toggleLike.mutate({ postId });
            }}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{post.likeCount || 0}</span>
          </button>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageSquare className="w-5 h-5" /> {post.commentCount || 0}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="w-5 h-5" /> {post.viewCount || 0}
          </span>
        </div>
      </div>

      {/* Comments */}
      <div className="border-t bg-muted/30">
        <div className="px-4 py-4">
          <h3 className="font-semibold text-sm mb-4">댓글 {comments?.length || 0}개</h3>
          <div className="space-y-4">
            {comments?.map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.authorName || "익명"}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(c.createdAt)}</span>
                  </div>
                  <p className="text-sm mt-1">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-3 max-w-lg mx-auto">
        <div className="flex gap-2">
          <Input
            placeholder="댓글을 입력하세요..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && comment.trim()) {
                if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                createComment.mutate({ postId, content: comment });
              }
            }}
            className="flex-1"
          />
          <Button
            size="icon"
            className="bg-emerald-700 hover:bg-emerald-800"
            disabled={!comment.trim() || createComment.isPending}
            onClick={() => {
              if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
              createComment.mutate({ postId, content: comment });
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
