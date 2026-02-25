import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Activity, Weight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BioReading {
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  weight?: number;
}

interface QuickBioBarProps {
  onSave?: (data: BioReading) => void;
}

export default function QuickBioBar({ onSave }: QuickBioBarProps) {
  const [activeModal, setActiveModal] = useState<"blood" | "glucose" | "weight" | null>(null);
  const [readings, setReadings] = useState<BioReading>({});

  const handleBloodPressure = (systolic: number, diastolic: number) => {
    setReadings({ ...readings, systolic, diastolic });
    onSave?.({ ...readings, systolic, diastolic });
    setActiveModal(null);
  };

  const handleGlucose = (glucose: number) => {
    setReadings({ ...readings, glucose });
    onSave?.({ ...readings, glucose });
    setActiveModal(null);
  };

  const handleWeight = (weight: number) => {
    setReadings({ ...readings, weight });
    onSave?.({ ...readings, weight });
    setActiveModal(null);
  };

  return (
    <>
      {/* 퀵 바 */}
      <motion.div
        className="fixed bottom-20 left-0 right-0 h-10 bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border-t border-[#d4af37]/30 flex items-center justify-center gap-2 px-4 z-40"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 혈압 버튼 */}
        <motion.button
          onClick={() => setActiveModal("blood")}
          className="flex-1 h-8 rounded-lg bg-gradient-to-r from-[#dc2626]/20 to-[#991b1b]/20 border border-[#dc2626]/50 flex items-center justify-center gap-1 hover:border-[#dc2626] transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Activity className="w-3 h-3" style={{ color: "#dc2626" }} />
          <span className="text-[10px] font-bold text-[#dc2626]">혈압</span>
          {readings.systolic && (
            <span className="text-[9px] text-[#dc2626]/70">
              {readings.systolic}/{readings.diastolic}
            </span>
          )}
        </motion.button>

        {/* 혈당 버튼 */}
        <motion.button
          onClick={() => setActiveModal("glucose")}
          className="flex-1 h-8 rounded-lg bg-gradient-to-r from-[#f97316]/20 to-[#ea580c]/20 border border-[#f97316]/50 flex items-center justify-center gap-1 hover:border-[#f97316] transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Droplet className="w-3 h-3" style={{ color: "#f97316" }} />
          <span className="text-[10px] font-bold text-[#f97316]">혈당</span>
          {readings.glucose && (
            <span className="text-[9px] text-[#f97316]/70">{readings.glucose}mg/dL</span>
          )}
        </motion.button>

        {/* 체중 버튼 */}
        <motion.button
          onClick={() => setActiveModal("weight")}
          className="flex-1 h-8 rounded-lg bg-gradient-to-r from-[#d4af37]/20 to-[#b8941f]/20 border border-[#d4af37]/50 flex items-center justify-center gap-1 hover:border-[#d4af37] transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Weight className="w-3 h-3" style={{ color: "#d4af37" }} />
          <span className="text-[10px] font-bold text-[#d4af37]">체중</span>
          {readings.weight && (
            <span className="text-[9px] text-[#d4af37]/70">{readings.weight}kg</span>
          )}
        </motion.button>
      </motion.div>

      {/* 혈압 모달 */}
      <AnimatePresence>
        {activeModal === "blood" && (
          <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
            <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#d4af37]/30">
              <DialogHeader>
                <DialogTitle className="text-[#d4af37]">혈압 측정</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-[#d4af37]/60">수축기 (mmHg)</label>
                  <input
                    type="number"
                    placeholder="120"
                    className="w-full h-10 rounded-lg bg-[#1a1a1a] border border-[#d4af37]/30 text-[#d4af37] px-3"
                    onChange={(e) => {
                      const systolic = parseInt(e.target.value) || 0;
                      const diastolic = readings.diastolic || 80;
                      if (systolic > 0) handleBloodPressure(systolic, diastolic);
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#d4af37]/60">이완기 (mmHg)</label>
                  <input
                    type="number"
                    placeholder="80"
                    className="w-full h-10 rounded-lg bg-[#1a1a1a] border border-[#d4af37]/30 text-[#d4af37] px-3"
                    onChange={(e) => {
                      const diastolic = parseInt(e.target.value) || 0;
                      const systolic = readings.systolic || 120;
                      if (diastolic > 0) handleBloodPressure(systolic, diastolic);
                    }}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* 혈당 모달 */}
      <AnimatePresence>
        {activeModal === "glucose" && (
          <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
            <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#d4af37]/30">
              <DialogHeader>
                <DialogTitle className="text-[#d4af37]">혈당 측정</DialogTitle>
              </DialogHeader>
              <div>
                <label className="text-[10px] text-[#d4af37]/60">혈당 (mg/dL)</label>
                <input
                  type="number"
                  placeholder="100"
                  className="w-full h-10 rounded-lg bg-[#1a1a1a] border border-[#d4af37]/30 text-[#d4af37] px-3"
                  onChange={(e) => {
                    const glucose = parseInt(e.target.value) || 0;
                    if (glucose > 0) handleGlucose(glucose);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* 체중 모달 */}
      <AnimatePresence>
        {activeModal === "weight" && (
          <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
            <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#d4af37]/30">
              <DialogHeader>
                <DialogTitle className="text-[#d4af37]">체중 측정</DialogTitle>
              </DialogHeader>
              <div>
                <label className="text-[10px] text-[#d4af37]/60">체중 (kg)</label>
                <input
                  type="number"
                  placeholder="70"
                  className="w-full h-10 rounded-lg bg-[#1a1a1a] border border-[#d4af37]/30 text-[#d4af37] px-3"
                  onChange={(e) => {
                    const weight = parseFloat(e.target.value) || 0;
                    if (weight > 0) handleWeight(weight);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
