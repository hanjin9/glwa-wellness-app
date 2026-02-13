import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare, Heart, Eye, Send, Plus, Image as ImageIcon,
  Users, BookOpen, Camera, Sparkles, Clock, User, ChevronRight
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const CATEGORY_MAP: Record<string, string> = {
  all: "전체",
  free: "자유게시판",
  health_tip: "건강 팁",
  exercise: "운동",
  nutrition: "영양",
  question: "질문",
  success_story: "성공 스토리",
};

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("board");
  const [postCategory, setPostCategory] = useState("all");
  const [showNewPost, setShowNewPost] = useState(false);
  const [showNewStory, setShowNewStory] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<string>("free");
  const [newStoryContent, setNewStoryContent] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: posts, isLoading: postsLoading } = trpc.community.getPosts.useQuery(
    { category: postCategory === "all" ? undefined : postCategory }
  );
  const { data: infoMessages } = trpc.community.getInfoMessages.useQuery();
  const { data: gallery } = trpc.community.getGallery.useQuery();
  const { data: stories } = trpc.community.getStories.useQuery();

  // Mutations
  const createPost = trpc.community.createPost.useMutation({
    onSuccess: () => {
      utils.community.getPosts.invalidate();
      setShowNewPost(false);
      setNewPostTitle("");
      setNewPostContent("");
      toast.success("게시글이 작성되었습니다");
    },
  });

  const sendInfoMsg = trpc.community.sendInfoMessage.useMutation({
    onSuccess: () => {
      utils.community.getInfoMessages.invalidate();
      setInfoMessage("");
    },
  });

  const createStory = trpc.community.createStory.useMutation({
    onSuccess: () => {
      utils.community.getStories.invalidate();
      setShowNewStory(false);
      setNewStoryContent("");
      toast.success("스토리가 등록되었습니다");
    },
  });

  const toggleLike = trpc.community.toggleLike.useMutation({
    onSuccess: () => utils.community.getPosts.invalidate(),
  });

  const requireAuth = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return false;
    }
    return true;
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "방금 전";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return `${Math.floor(diff / 86400000)}일 전`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800 text-white px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold">커뮤니티</h1>
        <p className="text-emerald-200 text-sm mt-1">GLWA 회원들과 건강 정보를 나눠보세요</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full rounded-none border-b bg-white h-12 p-0">
          <TabsTrigger value="board" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-700 data-[state=active]:text-emerald-700 h-full">
            <BookOpen className="w-4 h-4 mr-1" />게시판
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-700 data-[state=active]:text-emerald-700 h-full">
            <MessageSquare className="w-4 h-4 mr-1" />공유방
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-700 data-[state=active]:text-emerald-700 h-full">
            <Camera className="w-4 h-4 mr-1" />갤러리
          </TabsTrigger>
          <TabsTrigger value="story" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-700 data-[state=active]:text-emerald-700 h-full">
            <Sparkles className="w-4 h-4 mr-1" />스토리
          </TabsTrigger>
        </TabsList>

        {/* ─── 게시판 ─── */}
        <TabsContent value="board" className="mt-0">
          {/* Category Filter */}
          <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {Object.entries(CATEGORY_MAP).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPostCategory(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  postCategory === key
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="px-4 space-y-3">
            {postsLoading ? (
              <div className="py-12 text-center text-muted-foreground">로딩 중...</div>
            ) : !posts || posts.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">아직 게시글이 없습니다</p>
                <p className="text-sm text-muted-foreground">첫 번째 글을 작성해보세요!</p>
              </div>
            ) : (
              posts.map((post: any) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/community/post/${post.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{post.authorName || "익명"}</span>
                          <Badge variant="outline" className="text-xs">{CATEGORY_MAP[post.category] || post.category}</Badge>
                          <span className="text-xs text-muted-foreground ml-auto">{formatTime(post.createdAt)}</span>
                        </div>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{post.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {post.likeCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {post.commentCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {post.viewCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* New Post Button */}
          <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
            <DialogTrigger asChild>
              <Button
                className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-emerald-700 hover:bg-emerald-800 shadow-lg z-50"
                onClick={() => { if (!requireAuth()) return; setShowNewPost(true); }}
              >
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>새 글 작성</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                  <SelectTrigger><SelectValue placeholder="카테고리 선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">자유게시판</SelectItem>
                    <SelectItem value="health_tip">건강 팁</SelectItem>
                    <SelectItem value="exercise">운동</SelectItem>
                    <SelectItem value="nutrition">영양</SelectItem>
                    <SelectItem value="question">질문</SelectItem>
                    <SelectItem value="success_story">성공 스토리</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="제목을 입력하세요" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} />
                <Textarea placeholder="내용을 입력하세요" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} rows={6} />
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                  disabled={!newPostTitle.trim() || !newPostContent.trim() || createPost.isPending}
                  onClick={() => createPost.mutate({ category: newPostCategory as any, title: newPostTitle, content: newPostContent })}
                >
                  {createPost.isPending ? "작성 중..." : "게시하기"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── 정보공유방 ─── */}
        <TabsContent value="chat" className="mt-0">
          <div className="flex flex-col h-[calc(100vh-220px)]">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {!infoMessages || infoMessages.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">아직 메시지가 없습니다</p>
                  <p className="text-sm text-muted-foreground">건강 정보를 공유해보세요!</p>
                </div>
              ) : (
                [...infoMessages].reverse().map((msg: any) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.userId === user?.id ? "flex-row-reverse" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className={`max-w-[75%] ${msg.userId === user?.id ? "text-right" : ""}`}>
                      <span className="text-xs text-muted-foreground">{msg.authorName || "익명"}</span>
                      <div className={`mt-1 px-3 py-2 rounded-2xl text-sm ${
                        msg.userId === user?.id
                          ? "bg-emerald-700 text-white rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t bg-white px-4 py-3">
              <div className="flex gap-2">
                <Input
                  placeholder="건강 정보를 공유해보세요..."
                  value={infoMessage}
                  onChange={e => setInfoMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey && infoMessage.trim()) {
                      e.preventDefault();
                      if (!requireAuth()) return;
                      sendInfoMsg.mutate({ content: infoMessage });
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  className="bg-emerald-700 hover:bg-emerald-800"
                  disabled={!infoMessage.trim() || sendInfoMsg.isPending}
                  onClick={() => {
                    if (!requireAuth()) return;
                    sendInfoMsg.mutate({ content: infoMessage });
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ─── 갤러리 ─── */}
        <TabsContent value="gallery" className="mt-0">
          <div className="px-4 py-4">
            {!gallery || gallery.length === 0 ? (
              <div className="py-12 text-center">
                <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">아직 갤러리가 비어있습니다</p>
                <p className="text-sm text-muted-foreground">건강 여정의 사진을 공유해보세요!</p>
                <Button
                  className="mt-4 bg-emerald-700 hover:bg-emerald-800"
                  onClick={() => toast.info("사진 업로드 기능 준비 중", { description: "곧 오픈됩니다!" })}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  사진 올리기
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {gallery.map((item: any) => (
                  <div key={item.id} className="aspect-square bg-emerald-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {item.mediaUrl ? (
                      <img src={item.mediaUrl} alt={item.caption || ""} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-emerald-300" />
                    )}
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 line-clamp-1">
                        {item.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-emerald-700 hover:bg-emerald-800 shadow-lg z-50"
            onClick={() => toast.info("사진 업로드 기능 준비 중", { description: "곧 오픈됩니다!" })}
          >
            <Camera className="w-6 h-6" />
          </Button>
        </TabsContent>

        {/* ─── 스토리 ─── */}
        <TabsContent value="story" className="mt-0">
          <div className="px-4 py-4 space-y-3">
            {!stories || stories.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">아직 스토리가 없습니다</p>
                <p className="text-sm text-muted-foreground">나의 건강 이야기를 나눠보세요!</p>
              </div>
            ) : (
              stories.map((story: any) => (
                <Card key={story.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{story.authorName || "익명"}</span>
                          <span className="text-xs text-muted-foreground">{formatTime(story.createdAt)}</span>
                        </div>
                        <p className="text-sm mt-2 leading-relaxed">{story.content}</p>
                        {story.imageUrl && (
                          <div className="mt-3 rounded-lg overflow-hidden">
                            <img src={story.imageUrl} alt="" className="w-full" />
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-700">
                            <Heart className="w-3.5 h-3.5" /> {story.likeCount || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* New Story */}
          <Dialog open={showNewStory} onOpenChange={setShowNewStory}>
            <DialogTrigger asChild>
              <Button
                className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-emerald-700 hover:bg-emerald-800 shadow-lg z-50"
                onClick={() => { if (!requireAuth()) return; setShowNewStory(true); }}
              >
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>나의 스토리</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="건강 여정의 이야기를 짧게 남겨보세요..."
                  value={newStoryContent}
                  onChange={e => setNewStoryContent(e.target.value)}
                  rows={4}
                />
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                  disabled={!newStoryContent.trim() || createStory.isPending}
                  onClick={() => createStory.mutate({ content: newStoryContent })}
                >
                  {createStory.isPending ? "등록 중..." : "스토리 등록"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
