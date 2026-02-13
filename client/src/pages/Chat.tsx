import { trpc } from "@/lib/trpc";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Camera, Paperclip, X, Image, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SYSTEM_PROMPT = `당신은 GLWA 글로벌 리더스 웰니스 협회의 전담 건강 매니저입니다.
동양 철학과 현대 의학의 조화로운 관점에서 회원의 건강을 관리합니다.

핵심 원칙:
- 의료 행위가 아닌 생활 건강 관리 조언을 제공합니다
- 동양의학 기반 체질 분석과 생활 습관 개선을 안내합니다
- 숨과 알아차림에서 시작하여 다시 숨으로 돌아오는 10단계 수련 프로그램을 기반으로 조언합니다
- 근골격계 통증, 염증 관리, 중력 관리에 대한 생활 건강 팁을 제공합니다
- 심각한 증상은 반드시 의료 전문가 상담을 권유합니다
- 친절하고 따뜻한 어조로 대화합니다
- 한국어로 대화합니다
- 사용자가 사진이나 영상을 첨부하면 해당 내용을 참고하여 건강 상담을 제공합니다`;

type Attachment = {
  type: "image" | "video";
  file: File;
  preview: string;
  url?: string;
};

export default function Chat() {

  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: SYSTEM_PROMPT },
  ]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { data: chatHistory } = trpc.chat.getHistory.useQuery(undefined, { retry: false });
  
  const uploadFile = trpc.upload.complete.useMutation();
  const transcribeVoice = trpc.voice.transcribe.useMutation();

  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.content },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요." },
      ]);
    },
  });

  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const history: Message[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatHistory.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];
      setMessages(history);
    }
  }, [chatHistory]);

  // Voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        
        if (audioBlob.size > 16 * 1024 * 1024) {
          toast.error("음성 녹음은 16MB 이하여야 합니다.");
          return;
        }

        // Upload audio then transcribe
        try {
          const base64 = await blobToBase64(audioBlob);
          const ext = mediaRecorder.mimeType.includes("webm") ? "webm" : "m4a";
          const key = `voice/${Date.now()}.${ext}`;
          const { url } = await uploadFile.mutateAsync({
            key,
            base64Data: base64,
            contentType: mediaRecorder.mimeType,
          });

          toast.info("AI가 음성을 텍스트로 변환하고 있습니다.");
          const result = await transcribeVoice.mutateAsync({ audioUrl: url, language: "ko" });
          
          if (result.text) {
            // Auto-send transcribed text
            const newMessages: Message[] = [...messages, { role: "user", content: `🎙️ ${result.text}` }];
            setMessages(newMessages);
            sendMessage.mutate({
              messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            });
            toast.success("음성 입력 완료: " + result.text.substring(0, 50) + "...");
          }
        } catch (err) {
          toast.error("음성 변환에 실패했습니다. 다시 시도해 주세요.");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.info("말씀하세요. 완료 후 버튼을 다시 눌러주세요.");
    } catch (err) {
      toast.error("브라우저 설정에서 마이크 권한을 허용해 주세요.");
    }
  }, [messages, sendMessage, uploadFile, transcribeVoice]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  // File attachment
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}은 10MB 이하여야 합니다.`);
        continue;
      }

      const type = file.type.startsWith("video/") ? "video" : "image";
      const preview = URL.createObjectURL(file);
      newAttachments.push({ type, file, preview });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Upload attachments and send
  const uploadAttachments = useCallback(async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const att of attachments) {
      const base64 = await blobToBase64(att.file);
      const ext = att.file.name.split(".").pop() || (att.type === "video" ? "mp4" : "jpg");
      const key = `chat-attachments/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await uploadFile.mutateAsync({
        key,
        base64Data: base64,
        contentType: att.file.type,
      });
      urls.push(url);
    }
    return urls;
  }, [attachments, uploadFile]);

  const handleSend = async (content: string) => {
    let finalContent = content;

    if (attachments.length > 0) {
      setIsUploading(true);
      try {
        const urls = await uploadAttachments();
        const attachmentText = urls.map((url, i) => {
          const att = attachments[i];
          return att.type === "image" ? `📷 [첨부 이미지](${url})` : `🎬 [첨부 영상](${url})`;
        }).join("\n");
        finalContent = `${attachmentText}\n\n${content}`;
        setAttachments([]);
      } catch (err) {
        toast.error("파일 업로드에 실패했습니다. 다시 시도해 주세요.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const newMessages: Message[] = [...messages, { role: "user", content: finalContent }];
    setMessages(newMessages);
    sendMessage.mutate({
      messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', 'Noto Serif KR', serif" }}>
          건강 상담
        </h1>
        <p className="text-xs text-muted-foreground">AI 건강 매니저와 1:1 상담</p>
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {attachments.map((att, i) => (
            <div key={i} className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted">
              {att.type === "image" ? (
                <img src={att.preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/10">
                  <Video className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            녹음 중... {formatTime(recordingTime)}
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={stopRecording}
            className="ml-auto"
          >
            <MicOff className="w-4 h-4 mr-1" />
            녹음 중지
          </Button>
        </div>
      )}

      {/* Uploading Indicator */}
      {isUploading && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700 dark:text-blue-300">파일 업로드 중...</span>
        </div>
      )}

      <AIChatBox
        messages={messages}
        onSendMessage={handleSend}
        isLoading={sendMessage.isPending || isUploading || transcribeVoice.isPending}
        placeholder="건강 관련 질문을 입력하세요..."
        height="calc(100vh - 320px)"
        emptyStateMessage="건강 매니저에게 무엇이든 물어보세요"
        suggestedPrompts={[
          "오늘 허리가 아파요",
          "수면의 질을 높이는 방법",
          "스트레스 관리 팁",
          "체질에 맞는 식단 추천",
        ]}
      />

      {/* Bottom Action Bar */}
      <div className="flex items-center gap-2 px-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isRecording || sendMessage.isPending}
          className="gap-1.5 text-xs"
        >
          <Paperclip className="w-3.5 h-3.5" />
          사진/영상
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isRecording || sendMessage.isPending}
          className="gap-1.5 text-xs"
        >
          <Camera className="w-3.5 h-3.5" />
          카메라
        </Button>

        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={sendMessage.isPending || transcribeVoice.isPending}
          className="gap-1.5 text-xs ml-auto"
        >
          {isRecording ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              중지 {formatTime(recordingTime)}
            </>
          ) : transcribeVoice.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              변환 중...
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              음성 입력
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Helper: convert Blob/File to base64 string (without data: prefix)
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove "data:...;base64," prefix
      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
