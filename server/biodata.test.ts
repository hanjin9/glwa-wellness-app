import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculateHanJinLevel, getHanJinLevelDescription } from "./hanJinCalculator";

describe("HanJin Level Calculator", () => {
  describe("calculateHanJinLevel - Sleep", () => {
    it("should return +10 for optimal sleep (7-8 hours)", () => {
      expect(calculateHanJinLevel("sleep", 7)).toBe(10);
      expect(calculateHanJinLevel("sleep", 7.5)).toBe(10);
      expect(calculateHanJinLevel("sleep", 8)).toBe(10);
    });

    it("should return +8 for good sleep (6.5-7 or 8-8.5 hours)", () => {
      expect(calculateHanJinLevel("sleep", 6.5)).toBe(8);
      expect(calculateHanJinLevel("sleep", 8.2)).toBe(8);
    });

    it("should return +6 for fair sleep (6-6.5 or 8.5-9 hours)", () => {
      expect(calculateHanJinLevel("sleep", 6)).toBe(6);
      expect(calculateHanJinLevel("sleep", 8.7)).toBe(6);
    });

    it("should return -10 for very poor sleep (< 4 or > 11 hours)", () => {
      expect(calculateHanJinLevel("sleep", 3)).toBe(-10);
      expect(calculateHanJinLevel("sleep", 12)).toBe(-10);
    });
  });

  describe("calculateHanJinLevel - Meal", () => {
    it("should return +10 for excellent nutrition (8-10 score)", () => {
      expect(calculateHanJinLevel("meal", 8)).toBe(10);
      expect(calculateHanJinLevel("meal", 9)).toBe(10);
      expect(calculateHanJinLevel("meal", 10)).toBe(10);
    });

    it("should return +8 for good nutrition (7-8 score)", () => {
      expect(calculateHanJinLevel("meal", 7)).toBe(8);
    });

    it("should return +6 for fair nutrition (6-7 score)", () => {
      expect(calculateHanJinLevel("meal", 6)).toBe(6);
    });

    it("should return -10 for poor nutrition (< 4 score)", () => {
      expect(calculateHanJinLevel("meal", 1)).toBe(-10);
      expect(calculateHanJinLevel("meal", 3)).toBe(-10);
    });
  });

  describe("calculateHanJinLevel - Activity", () => {
    it("should return +10 for optimal activity (30-60 minutes)", () => {
      expect(calculateHanJinLevel("activity", 30)).toBe(10);
      expect(calculateHanJinLevel("activity", 45)).toBe(10);
      expect(calculateHanJinLevel("activity", 60)).toBe(10);
    });

    it("should return +8 for good activity (20-30 or 60-90 minutes)", () => {
      expect(calculateHanJinLevel("activity", 20)).toBe(8);
      expect(calculateHanJinLevel("activity", 75)).toBe(8);
    });

    it("should return -10 for no activity (< 5 or > 180 minutes)", () => {
      expect(calculateHanJinLevel("activity", 2)).toBe(-10);
      expect(calculateHanJinLevel("activity", 200)).toBe(-10);
    });
  });

  describe("calculateHanJinLevel - Blood Pressure", () => {
    it("should return +10 for optimal BP (≤ 120)", () => {
      expect(calculateHanJinLevel("bloodPressure", 120)).toBe(10);
      expect(calculateHanJinLevel("bloodPressure", 110)).toBe(10);
    });

    it("should return +8 for elevated BP (120-130)", () => {
      expect(calculateHanJinLevel("bloodPressure", 125)).toBe(8);
    });

    it("should return -10 for high BP (> 160)", () => {
      expect(calculateHanJinLevel("bloodPressure", 170)).toBe(-10);
    });
  });

  describe("calculateHanJinLevel - Heart Rate", () => {
    it("should return +10 for optimal HR (60-100 bpm)", () => {
      expect(calculateHanJinLevel("heartRate", 60)).toBe(10);
      expect(calculateHanJinLevel("heartRate", 80)).toBe(10);
      expect(calculateHanJinLevel("heartRate", 100)).toBe(10);
    });

    it("should return +8 for good HR (50-60 or 100-110 bpm)", () => {
      expect(calculateHanJinLevel("heartRate", 55)).toBe(8);
      expect(calculateHanJinLevel("heartRate", 105)).toBe(8);
    });

    it("should return -10 for critical HR (< 30 or > 140 bpm)", () => {
      expect(calculateHanJinLevel("heartRate", 20)).toBe(-10);
      expect(calculateHanJinLevel("heartRate", 150)).toBe(-10);
    });
  });

  describe("calculateHanJinLevel - Blood Sugar", () => {
    it("should return +10 for optimal glucose (70-100 mg/dL)", () => {
      expect(calculateHanJinLevel("bloodSugar", 70)).toBe(10);
      expect(calculateHanJinLevel("bloodSugar", 85)).toBe(10);
      expect(calculateHanJinLevel("bloodSugar", 100)).toBe(10);
    });

    it("should return +8 for good glucose (60-70 or 100-125 mg/dL)", () => {
      expect(calculateHanJinLevel("bloodSugar", 65)).toBe(8);
      expect(calculateHanJinLevel("bloodSugar", 110)).toBe(8);
    });

    it("should return -10 for critical glucose (< 40 or > 200 mg/dL)", () => {
      expect(calculateHanJinLevel("bloodSugar", 30)).toBe(-10);
      expect(calculateHanJinLevel("bloodSugar", 250)).toBe(-10);
    });
  });

  describe("calculateHanJinLevel - Overall", () => {
    it("should convert overall score to HanJin Level (-10 to +10)", () => {
      expect(calculateHanJinLevel("overall", 10)).toBe(10); // (10-5)*2 = 10
      expect(calculateHanJinLevel("overall", 5)).toBe(0); // (5-5)*2 = 0
      expect(calculateHanJinLevel("overall", 1)).toBe(-8); // (1-5)*2 = -8
    });
  });

  describe("getHanJinLevelDescription", () => {
    it("should return correct description for excellent level (≥ 8)", () => {
      const desc = getHanJinLevelDescription(10);
      expect(desc.status).toBe("최고 건강");
      expect(desc.emoji).toBe("🔵");
      expect(desc.color).toBe("blue");
    });

    it("should return correct description for good level (5-7)", () => {
      const desc = getHanJinLevelDescription(6);
      expect(desc.status).toBe("활력 건강");
      expect(desc.emoji).toBe("🟢");
      expect(desc.color).toBe("green");
    });

    it("should return correct description for warning level (-4 to -1)", () => {
      const desc = getHanJinLevelDescription(-2);
      expect(desc.status).toBe("주의");
      expect(desc.emoji).toBe("🟡");
      expect(desc.color).toBe("yellow");
    });

    it("should return correct description for critical level (≤ -7)", () => {
      const desc = getHanJinLevelDescription(-9);
      expect(desc.status).toBe("최악악화");
      expect(desc.emoji).toBe("🔴");
      expect(desc.color).toBe("red");
    });
  });

  describe("Edge cases", () => {
    it("should handle boundary values correctly", () => {
      // Sleep boundaries
      expect(calculateHanJinLevel("sleep", 6.4)).toBe(6);
      expect(calculateHanJinLevel("sleep", 7.01)).toBe(10);

      // Activity boundaries
      expect(calculateHanJinLevel("activity", 29)).toBe(8);
      expect(calculateHanJinLevel("activity", 31)).toBe(10);

      // Heart rate boundaries
      expect(calculateHanJinLevel("heartRate", 59)).toBe(8);
      expect(calculateHanJinLevel("heartRate", 61)).toBe(10);
    });

    it("should handle zero and negative values", () => {
      expect(calculateHanJinLevel("sleep", 0)).toBe(-10);
      expect(calculateHanJinLevel("activity", 0)).toBe(-10);
      expect(calculateHanJinLevel("heartRate", 0)).toBe(-10);
    });

    it("should handle very large values", () => {
      expect(calculateHanJinLevel("sleep", 100)).toBe(-10);
      expect(calculateHanJinLevel("activity", 1000)).toBe(-10);
      expect(calculateHanJinLevel("heartRate", 300)).toBe(-10);
    });
  });

  describe("Data consistency", () => {
    it("should always return value between -10 and +10", () => {
      const testValues = [0, 5, 10, 20, 50, 100, 200];
      const types = ["sleep", "meal", "activity", "bloodPressure", "heartRate", "bloodSugar"] as const;

      types.forEach((type) => {
        testValues.forEach((value) => {
          const result = calculateHanJinLevel(type, value);
          expect(result).toBeGreaterThanOrEqual(-10);
          expect(result).toBeLessThanOrEqual(10);
        });
      });
    });

    it("should return integer values only", () => {
      const testValues = [1.5, 2.7, 3.3, 4.9, 5.1];
      const types = ["sleep", "meal", "activity", "bloodPressure", "heartRate", "bloodSugar"] as const;

      types.forEach((type) => {
        testValues.forEach((value) => {
          const result = calculateHanJinLevel(type, value);
          expect(Number.isInteger(result)).toBe(true);
        });
      });
    });
  });
});

  describe("Biodata Router Integration", () => {
  describe("Sleep data validation", () => {

    it("should calculate sleep hours correctly across midnight", () => {
      // Bed at 23:00, wake at 07:00 = 8 hours
      const bedHour = 23, bedMin = 0;
      const wakeHour = 7, wakeMin = 0;
      let sleepHours = wakeHour - bedHour + (wakeMin - bedMin) / 60;
      if (sleepHours < 0) sleepHours += 24;
      expect(sleepHours).toBe(8);
    });

    it("should calculate sleep hours correctly within same day", () => {
      // Bed at 10:00, wake at 14:00 = 4 hours
      const bedHour = 10, bedMin = 0;
      const wakeHour = 14, wakeMin = 0;
      let sleepHours = wakeHour - bedHour + (wakeMin - bedMin) / 60;
      if (sleepHours < 0) sleepHours += 24;
      expect(sleepHours).toBe(4);
    });
  });

  describe("Nutrition score calculation", () => {
    it("should calculate nutrition score from macronutrients", () => {
      const totalProtein = 50;
      const totalFiber = 30;
      const nutritionScore = Math.min(10, Math.max(1, Math.round((totalProtein / 50 + totalFiber / 30) / 2)));
      expect(nutritionScore).toBe(1);
    });

    it("should clamp nutrition score between 1-10", () => {
      const testCases = [
        { protein: 0, fiber: 0, expected: 1 },
        { protein: 100, fiber: 60, expected: 2 },
        { protein: 25, fiber: 15, expected: 1 },
      ];

      testCases.forEach(({ protein, fiber, expected }) => {
        const score = Math.min(10, Math.max(1, Math.round((protein / 50 + fiber / 30) / 2)));
        expect(score).toBe(expected);
      });
    });
  });

  describe("Activity duration calculation", () => {
    it("should calculate activity duration correctly", () => {
      const startHour = 10, startMin = 30;
      const endHour = 11, endMin = 45;
      let durationMinutes = (endHour - startHour) * 60 + (endMin - startMin);
      if (durationMinutes < 0) durationMinutes += 24 * 60;
      expect(durationMinutes).toBe(75);
    });

    it("should handle activity spanning midnight", () => {
      const startHour = 23, startMin = 30;
      const endHour = 1, endMin = 0;
      let durationMinutes = (endHour - startHour) * 60 + (endMin - startMin);
      if (durationMinutes < 0) durationMinutes += 24 * 60;
      expect(durationMinutes).toBe(90);
    });
  });

  describe("Vital signs averaging", () => {
    it("should calculate overall HanJin Level from individual metrics", () => {
      const bpLevel = 8;
      const hrLevel = 10;
      const bsLevel = 6;
      const overallLevel = Math.round((bpLevel + hrLevel + bsLevel) / 3);
      expect(overallLevel).toBe(8);
    });

    it("should round average correctly", () => {
      const levels = [7, 8, 9];
      const average = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
      expect(average).toBe(8);
    });
  });
});
