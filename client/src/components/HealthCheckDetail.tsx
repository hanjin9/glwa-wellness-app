import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Upload, Calendar, AlertCircle } from "lucide-react";
import { getHanJinLevelInfo, getHanJinGradient, formatHanJinLevel } from "@/utils/hanJinLevel";

interface HealthCheckDetailProps {
  bodyPart: {
    id: string;
    koreanName: string;
    color: string;
    symptoms: string[];
  };
  onClose: () => void;
  onSave: (data: HealthCheckData) => void;
}

export interface HealthCheckData {
  bodyPartId: string;
  description: string;
  painIntensity: number; // HanJin Level: -10 ~ +10
  startDate: Date;
  endDate: Date;
  images: File[];
  selectedSymptoms: string[];
  recordedAudio?: Blob;
}

export default function HealthCheckDetail({
  bodyPart,
  onClose,
  onSave,
}: HealthCheckDetailProps) {
  const [description, setDescription] = useState("");
  const [painIntensity, setPainIntensity] = useState(0); // HanJin Level: -10 ~ +10
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [images, setImages] = useState<File[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedAudio(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("마이크 접근 실패:", error);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  // 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages([...images, ...files]);
  };

  // 이미지 제거
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 증상 선택
  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  // 저장
  const handleSave = () => {
    onSave({
      bodyPartId: bodyPart.id,
      description,
      painIntensity,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      images,
      selectedSymptoms,
      recordedAudio: recordedAudio || undefined,
    });
    onClose();
  };

  const getPainInfo = (intensity: number) => {
    return getHanJinLevelInfo(intensity);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border border-[#d4af37]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border-b border-[#d4af37]/20 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: bodyPart.color }}
              />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {bodyPart.koreanName} 상세 입력
                </h2>
                <p className="text-xs text-[#d4af37]/60">
                  증상 정보를 자세히 기록해주세요
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className="p-6 space-y-6">
            {/* 1. 증상 선택 */}
            <div>
              <label className="block text-sm font-semibold text-[#d4af37] mb-3">
                주요 증상 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                {bodyPart.symptoms.map((symptom) => (
                  <label
                    key={symptom}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#d4af37]/10 hover:bg-[#d4af37]/20 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(symptom)}
                      onChange={() => toggleSymptom(symptom)}
                      className="w-4 h-4 rounded border-[#d4af37]/30 bg-black checked:bg-[#d4af37] cursor-pointer"
                    />
                    <span className="text-sm text-[#d4af37]/80">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. 증상 설명 (텍스트) */}
            <div>
              <label className="block text-sm font-semibold text-[#d4af37] mb-3">
                증상 설명 (텍스트)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="증상을 자세히 설명해주세요. 예: 어디가 아픈지, 어떤 느낌인지, 언제부터 시작되었는지 등..."
                className="w-full h-24 bg-black/50 border border-[#d4af37]/20 rounded-lg p-3 text-white placeholder-[#d4af37]/40 focus:border-[#d4af37]/50 focus:outline-none resize-none"
              />
              <p className="text-xs text-[#d4af37]/50 mt-2">
                {description.length}/500자
              </p>
            </div>

            {/* 3. 음성 입력 */}
            <div>
              <label className="block text-sm font-semibold text-[#d4af37] mb-3">
                음성 입력 (선택)
              </label>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isRecording
                      ? "bg-red-500/20 border border-red-500/50 text-red-400"
                      : "bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37]"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      녹음 중지
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      음성 녹음
                    </>
                  )}
                </motion.button>
                {recordedAudio && (
                  <div className="flex-1 bg-green-500/20 border border-green-500/50 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-green-400">음성 녹음됨</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. 통증 강도 (HanJin Level) */}
            <div>
              <label className="block text-sm font-semibold text-[#d4af37] mb-3">
                통증 강도 (HanJin Level)
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="-10"
                  max="10"
                  value={painIntensity}
                  onChange={(e) => setPainIntensity(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: getHanJinGradient(),
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#d4af37]/60">-10 (최악)</span>
                  <span className={`text-2xl font-bold ${painIntensity >= -10 && painIntensity <= 10 ? painIntensity <= -8 ? 'text-red-700' : painIntensity <= -5 ? 'text-orange-600' : painIntensity <= -2 ? 'text-yellow-600' : painIntensity <= 1 ? 'text-gray-400' : painIntensity <= 4 ? 'text-lime-500' : painIntensity <= 7 ? 'text-green-600' : 'text-blue-700' : 'text-white'}`}>
                    {formatHanJinLevel(painIntensity)}
                  </span>
                  <span className="text-xs text-[#d4af37]/60">+10 (최고)</span>
                </div>
                <p className="text-xs text-center text-[#d4af37]/60">
                  {painIntensity >= -10 && painIntensity <= 10 ? painIntensity <= -8 ? '최악악화 (집중치료)' : painIntensity <= -5 ? '심각 (집중관리)' : painIntensity <= -2 ? '주의 (관리)' : painIntensity <= 1 ? '정상' : painIntensity <= 4 ? '양호' : painIntensity <= 7 ? '활력건강' : '최고' : ''}
                </p>
              </div>
            </div>

            {/* 5. 지속 기간 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#d4af37] mb-3">
                  시작일
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#d4af37]/60 pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-black/50 border border-[#d4af37]/20 rounded-lg p-3 pl-10 text-white focus:border-[#d4af37]/50 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#d4af37] mb-3">
                  현재까지
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#d4af37]/60 pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-black/50 border border-[#d4af37]/20 rounded-lg p-3 pl-10 text-white focus:border-[#d4af37]/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 6. 이미지 업로드 */}
            <div>
              <label className="block text-sm font-semibold text-[#d4af37] mb-3">
                이미지 첨부 (선택)
              </label>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-[#d4af37]/30 rounded-lg hover:border-[#d4af37]/60 transition-colors flex items-center justify-center gap-2 text-[#d4af37]"
              >
                <Upload className="w-4 h-4" />
                이미지 업로드 (피부 상태, 부종 등)
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* 업로드된 이미지 미리보기 */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {images.map((image, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`업로드 이미지 ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-[#d4af37]/20"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </motion.button>
                      <p className="text-xs text-[#d4af37]/60 mt-1 truncate">
                        {image.name}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 주의 사항 */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-400/80">
                <p className="font-semibold mb-1">주의:</p>
                <p>
                  심각한 증상이나 응급 상황이 발생하면 즉시 의료 전문가에게 상담하세요.
                </p>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#0a0a0a] to-transparent border-t border-[#d4af37]/20 p-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 border border-[#d4af37]/30 text-[#d4af37] font-semibold rounded-lg hover:bg-[#d4af37]/10 transition-colors"
            >
              취소
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-black font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              저장
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
