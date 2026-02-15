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
  Users, BookOpen, Camera, Sparkles, Clock, User, ChevronRight,
  Crown, Lock, Trophy, Star
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { MediaInputToolbar, type MediaFile } from "@/components/MediaInputToolbar";

const CATEGORY_MAP: Record<string, string> = {
  all: "전체",
  free: "자유게시판",
  health_tip: "건강 팁",
  exercise: "운동",
  nutrition: "영양",
  question: "질문",
  success_story: "VIP 라운지 스토리",
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
  const [postMedia, setPostMedia] = useState<MediaFile[]>([]);
  const [storyMedia, setStoryMedia] = useState<MediaFile[]>([]);
  const [chatMedia, setChatMedia] = useState<MediaFile[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<MediaFile[]>([]);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [hallOfFameView, setHallOfFameView] = useState<"menu" | "stories" | "vip">("menu");

  // VIP 접근 권한 체크 (diamond 이상)
  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const VIP_TIERS = ["diamond", "blue_diamond", "platinum", "black_platinum"];
  const isVipMember = profile?.memberGrade ? VIP_TIERS.includes(profile.memberGrade) : false;

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
      toast.success("VIP 라운지 스토리가 등록되었습니다");
    },
  });

  const toggleLike = trpc.community.toggleLike.useMutation({
    onSuccess: () => utils.community.getPosts.invalidate(),
  });

  const createGallery = trpc.community.addGalleryItem.useMutation({
    onSuccess: () => {
      utils.community.getGallery.invalidate();
      toast.success("갤러리에 업로드되었습니다");
    },
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
            <MessageSquare className="w-4 h-4 mr-1" />건강공유방
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-700 data-[state=active]:text-emerald-700 h-full">
            <Camera className="w-4 h-4 mr-1" />나의 작은다락방
          </TabsTrigger>
          <TabsTrigger value="story" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-700 data-[state=active]:text-emerald-700 h-full" onClick={() => setHallOfFameView("menu")}>
            <Trophy className="w-4 h-4 mr-1" />명예의전당
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
                    <SelectItem value="success_story">명예의전당 스토리</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="제목을 입력하세요" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} />
                <Textarea placeholder="내용을 입력하세요" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} rows={6} />
                <MediaInputToolbar
                  onTextFromVoice={(text) => setNewPostContent(prev => prev ? prev + " " + text : text)}
                  attachedMedia={postMedia}
                  onMediaAttached={setPostMedia}
                  onRemoveMedia={(idx) => setPostMedia(prev => prev.filter((_, i) => i !== idx))}
                />
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                  disabled={!newPostTitle.trim() || !newPostContent.trim() || createPost.isPending}
                  onClick={() => {
                    const mediaText = postMedia.length > 0 ? "\n\n" + postMedia.map(m => m.type === "image" ? `![${m.name}](${m.url})` : `[🎥 ${m.name}](${m.url})`).join("\n") : "";
                    createPost.mutate({ category: newPostCategory as any, title: newPostTitle, content: newPostContent + mediaText });
                  }}
                >
                  {createPost.isPending ? "작성 중..." : "게시하기"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── 건강공유방 ─── */}
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
              <MediaInputToolbar
                compact
                className="mb-2"
                onTextFromVoice={(text) => setInfoMessage(prev => prev ? prev + " " + text : text)}
                attachedMedia={chatMedia}
                onMediaAttached={setChatMedia}
                onRemoveMedia={(idx) => setChatMedia(prev => prev.filter((_, i) => i !== idx))}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="건강 정보를 공유해보세요..."
                  value={infoMessage}
                  onChange={e => setInfoMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey && infoMessage.trim()) {
                      e.preventDefault();
                      if (!requireAuth()) return;
                      const mediaText = chatMedia.length > 0 ? " " + chatMedia.map(m => m.url).join(" ") : "";
                      sendInfoMsg.mutate({ content: infoMessage + mediaText });
                      setChatMedia([]);
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
                    const mediaText = chatMedia.length > 0 ? " " + chatMedia.map(m => m.url).join(" ") : "";
                    sendInfoMsg.mutate({ content: infoMessage + mediaText });
                    setChatMedia([]);
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ─── 나의 작은다락방 갤러리 ─── */}
        <TabsContent value="gallery" className="mt-0">
          <div className="px-4 py-4">
            {!gallery || gallery.length === 0 ? (
              <div className="py-12 text-center">
                <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">아직 다락방 갤러리가 비어있습니다</p>
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

          {/* Gallery Upload Dialog */}
          <Dialog open={showGalleryUpload} onOpenChange={setShowGalleryUpload}>
            <DialogTrigger asChild>
              <Button
                className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-emerald-700 hover:bg-emerald-800 shadow-lg z-50"
                onClick={() => { if (!requireAuth()) return; setShowGalleryUpload(true); }}
              >
                <Camera className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>나의 작은다락방에 사진/영상 올리기</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="사진 설명을 입력하세요..." value={galleryCaption} onChange={e => setGalleryCaption(e.target.value)} />
                <MediaInputToolbar
                  onTextFromVoice={(text) => setGalleryCaption(prev => prev ? prev + " " + text : text)}
                  attachedMedia={galleryMedia}
                  onMediaAttached={setGalleryMedia}
                  onRemoveMedia={(idx) => setGalleryMedia(prev => prev.filter((_, i) => i !== idx))}
                />
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                  disabled={galleryMedia.length === 0}
                  onClick={() => {
                    galleryMedia.forEach(m => {
                      createGallery.mutate({ mediaUrl: m.url, caption: galleryCaption, mediaType: m.type === "video" ? "video" : "photo" });
                    });
                    setGalleryMedia([]);
                    setGalleryCaption("");
                    setShowGalleryUpload(false);
                  }}
                >
                  업로드
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── 명예의전당 (스토리 + VIP 라운지) ─── */}
        <TabsContent value="story" className="mt-0">
          {hallOfFameView === "menu" && (
            <div className="px-4 py-6 space-y-4">
              {/* 명예의전당 헤더 */}
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-3 shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-bold">명예의 전당</h2>
                <p className="text-sm text-muted-foreground mt-1">건강 여정의 이야기를 나누는 공간</p>
              </div>

              {/* 명예의전당 스토리 */}
              <button
                onClick={() => setHallOfFameView("stories")}
                className="w-full group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-base">명예의전당 스토리</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">회원들의 건강 성공 이야기를 읽고 공유하세요</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-300">
                          {stories?.length || 0}개 스토리
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">모든 회원 접근 가능</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                  </CardContent>
                </Card>
              </button>

              {/* VIP 라운지 */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    window.location.href = getLoginUrl();
                    return;
                  }
                  if (!isVipMember) {
                    toast.error("VIP 라운지는 Diamond LEVEL 이상 회원만 입장 가능합니다", {
                      description: "등급 업그레이드 후 이용해주세요",
                    });
                    return;
                  }
                  setHallOfFameView("vip");
                }}
                className="w-full group"
              >
                <Card className={`overflow-hidden hover:shadow-lg transition-all ${
                  isVipMember
                    ? "border-purple-300 bg-gradient-to-r from-purple-50 to-violet-50"
                    : "border-gray-200 bg-gray-50 opacity-80"
                }`}>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform ${
                      isVipMember
                        ? "bg-gradient-to-br from-purple-500 to-violet-600"
                        : "bg-gradient-to-br from-gray-400 to-gray-500"
                    }`}>
                      {isVipMember ? <Crown className="w-7 h-7 text-white" /> : <Lock className="w-7 h-7 text-white" />}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base">VIP 라운지</h3>
                        {!isVipMember && (
                          <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-500 border-gray-300">
                            <Lock className="w-2.5 h-2.5 mr-0.5" /> 잠김
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isVipMember
                          ? "Diamond LEVEL 이상 전용 프리미엄 공간"
                          : "Diamond LEVEL 이상 회원만 입장 가능"
                        }
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-[10px] ${
                          isVipMember
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-gray-100 text-gray-500 border-gray-300"
                        }`}>
                          <Crown className="w-2.5 h-2.5 mr-0.5" /> VIP 전용
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {isVipMember ? "프리미엄 콘텐츠 & 네트워킹" : "Diamond / Platinum / Black Platinum"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-colors ${
                      isVipMember ? "text-purple-400 group-hover:text-purple-600" : "text-gray-400"
                    }`} />
                  </CardContent>
                </Card>
              </button>
            </div>
          )}

          {/* 명예의전당 스토리 뷰 */}
          {hallOfFameView === "stories" && (
            <div>
              {/* 뒤로가기 버튼 */}
              <div className="px-4 py-3 border-b bg-amber-50/50">
                <button onClick={() => setHallOfFameView("menu")} className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <Star className="w-4 h-4" />
                  <span className="font-medium">명예의전당 스토리</span>
                </button>
              </div>

              <div className="px-4 py-4 space-y-3">
                {!stories || stories.length === 0 ? (
                  <div className="py-12 text-center">
                    <Star className="w-12 h-12 mx-auto mb-3 text-amber-400 opacity-50" />
                    <p className="text-muted-foreground">아직 명예의전당 스토리가 없습니다</p>
                    <p className="text-sm text-muted-foreground">나의 건강 성공 이야기를 남겨보세요!</p>
                  </div>
                ) : (
                  stories.map((story: any) => (
                    <Card key={story.id} className="overflow-hidden border-amber-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shrink-0">
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
                              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-700">
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

              {/* 스토리 작성 버튼 */}
              <Dialog open={showNewStory} onOpenChange={setShowNewStory}>
                <DialogTrigger asChild>
                  <Button
                    className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 shadow-lg z-50"
                    onClick={() => { if (!requireAuth()) return; setShowNewStory(true); }}
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>명예의전당 스토리 등록</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="건강 여정의 이야기를 짧게 남겨보세요..."
                      value={newStoryContent}
                      onChange={e => setNewStoryContent(e.target.value)}
                      rows={4}
                    />
                    <MediaInputToolbar
                      onTextFromVoice={(text) => setNewStoryContent(prev => prev ? prev + " " + text : text)}
                      attachedMedia={storyMedia}
                      onMediaAttached={setStoryMedia}
                      onRemoveMedia={(idx) => setStoryMedia(prev => prev.filter((_, i) => i !== idx))}
                    />
                    <Button
                      className="w-full bg-amber-500 hover:bg-amber-600"
                      disabled={!newStoryContent.trim() || createStory.isPending}
                      onClick={() => {
                        const imageUrl = storyMedia.find(m => m.type === "image")?.url;
                        createStory.mutate({ content: newStoryContent, imageUrl });
                        setStoryMedia([]);
                      }}
                    >
                      {createStory.isPending ? "등록 중..." : "명예의전당 스토리 등록"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* VIP 라운지 뷰 */}
          {hallOfFameView === "vip" && isVipMember && (
            <div>
              {/* 뒤로가기 버튼 */}
              <div className="px-4 py-3 border-b bg-purple-50/50">
                <button onClick={() => setHallOfFameView("menu")} className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-800">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <Crown className="w-4 h-4" />
                  <span className="font-medium">VIP 라운지</span>
                </button>
              </div>

              <div className="px-4 py-6">
                {/* VIP 헤더 */}
                <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">VIP 라운지</h2>
                      <p className="text-xs text-white/80">글로벌 리더 전용 프리미엄 공간</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-white/15 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold">128</p>
                      <p className="text-[10px] text-white/70">온라인 VIP</p>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold">24</p>
                      <p className="text-[10px] text-white/70">이번주 활동</p>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold">VIP</p>
                      <p className="text-[10px] text-white/70">내 등급</p>
                    </div>
                  </div>
                </div>

                {/* VIP 전용 콘텐츠 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-600" /> VIP 전용 콘텐츠
                  </h3>
                  {[
                    { icon: "🏥", title: "프리미엄 건강관리", desc: "1:1 전문가 상담 예약" },
                    { icon: "🌍", title: "글로벌 네트워킹", desc: "VIP 전용 네트워킹 이벤트" },
                    { icon: "✈️", title: "테마 여행", desc: "건강 테마 여행 우선 예약" },
                    { icon: "🍷", title: "와인 파티", desc: "VIP 전용 와인 & 다이닝" },
                    { icon: "🎨", title: "취미 서클", desc: "프리미엄 취미 클래스" },
                    { icon: "🎫", title: "VIP 쿠폰", desc: "월별 특별 할인 쿠폰" },
                  ].map((item, i) => (
                    <Card key={i} className="border-purple-200 hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl shrink-0">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-purple-400" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <p className="text-center text-[10px] text-muted-foreground mt-6">
                  VIP 라운지는 Diamond LEVEL 이상 회원만 이용 가능합니다
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
