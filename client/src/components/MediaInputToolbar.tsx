import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Camera, Video, ImagePlus, X, Loader2, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MediaFile {
  url: string;
  type: "image" | "video" | "audio";
  name: string;
}

interface MediaInputToolbarProps {
  onTextFromVoice?: (text: string) => void;
  onMediaAttached?: (files: MediaFile[]) => void;
  attachedMedia?: MediaFile[];
  onRemoveMedia?: (index: number) => void;
  compact?: boolean;
  className?: string;
}

export function MediaInputToolbar({
  onTextFromVoice,
  onMediaAttached,
  attachedMedia = [],
  onRemoveMedia,
  compact = false,
  className = "",
}: MediaInputToolbarProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transcribeVoice = trpc.voice.transcribe.useMutation();
  const uploadComplete = trpc.upload.complete.useMutation();

  // === Voice Recording ===
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size > 16 * 1024 * 1024) {
          toast.error("녹음 파일이 16MB를 초과합니다.");
          return;
        }

        setIsTranscribing(true);
        try {
          // Upload audio
          const ext = mimeType === "audio/webm" ? "webm" : "m4a";
          const base64 = await blobToBase64(blob);
          const { url } = await uploadComplete.mutateAsync({
            key: `voice/${Date.now()}.${ext}`,
            base64Data: base64,
            contentType: mimeType,
          });

          // Transcribe
          const result = await transcribeVoice.mutateAsync({ audioUrl: url, language: "ko" });
          if (result.text && onTextFromVoice) {
            onTextFromVoice(result.text);
            toast.success("음성이 텍스트로 변환되었습니다");
          }
        } catch {
          toast.error("음성 변환에 실패했습니다");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("마이크 접근 권한이 필요합니다");
    }
  }, [onTextFromVoice, transcribeVoice, uploadComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  // === File Upload ===
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      const newMedia: MediaFile[] = [];

      try {
        for (const file of Array.from(files)) {
          if (file.size > 50 * 1024 * 1024) {
            toast.error(`${file.name}이(가) 50MB를 초과합니다`);
            continue;
          }

          const base64 = await fileToBase64(file);
          const ext = file.name.split(".").pop() || "bin";
          const key = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { url } = await uploadComplete.mutateAsync({
            key,
            base64Data: base64,
            contentType: file.type,
          });

          let type: "image" | "video" | "audio" = "image";
          if (file.type.startsWith("video/")) type = "video";
          else if (file.type.startsWith("audio/")) type = "audio";

          newMedia.push({ url, type, name: file.name });
        }

        if (newMedia.length > 0 && onMediaAttached) {
          onMediaAttached([...attachedMedia, ...newMedia]);
          toast.success(`${newMedia.length}개 파일이 업로드되었습니다`);
        }
      } catch {
        toast.error("파일 업로드에 실패했습니다");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [attachedMedia, onMediaAttached, uploadComplete]
  );

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className={className}>
      {/* Toolbar Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Voice Recording */}
        {isRecording ? (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-8 text-xs gap-1 animate-pulse"
            onClick={stopRecording}
          >
            <MicOff className="w-3.5 h-3.5" />
            {formatTime(recordingTime)} 중지
          </Button>
        ) : isTranscribing ? (
          <Button type="button" size="sm" variant="outline" className="h-8 text-xs gap-1" disabled>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            변환 중...
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            onClick={startRecording}
            title="음성 녹음"
          >
            <Mic className="w-3.5 h-3.5" />
            {!compact && "녹음"}
          </Button>
        )}

        {/* Photo Upload */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = "image/*";
              fileInputRef.current.click();
            }
          }}
          disabled={isUploading}
          title="사진 업로드"
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
          {!compact && "사진"}
        </Button>

        {/* Video Upload */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = "video/*";
              fileInputRef.current.click();
            }
          }}
          disabled={isUploading}
          title="영상 업로드"
        >
          <Video className="w-3.5 h-3.5" />
          {!compact && "영상"}
        </Button>

        {/* Camera Capture */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = "image/*";
              fileInputRef.current.setAttribute("capture", "environment");
              fileInputRef.current.click();
              setTimeout(() => fileInputRef.current?.removeAttribute("capture"), 100);
            }
          }}
          disabled={isUploading}
          title="카메라 촬영"
        >
          <Camera className="w-3.5 h-3.5" />
          {!compact && "촬영"}
        </Button>

        <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileSelect} />
      </div>

      {/* Attached Media Preview */}
      {attachedMedia.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {attachedMedia.map((media, idx) => (
            <div key={idx} className="relative group">
              {media.type === "image" ? (
                <img src={media.url} alt={media.name} className="w-16 h-16 rounded-lg object-cover border border-border/40" />
              ) : media.type === "video" ? (
                <div className="w-16 h-16 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-center">
                  <Video className="w-6 h-6 text-muted-foreground" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-center">
                  <FileAudio className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              {onRemoveMedia && (
                <button
                  type="button"
                  onClick={() => onRemoveMedia(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helpers
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fileToBase64(file: File): Promise<string> {
  return blobToBase64(file);
}

export type { MediaFile };
