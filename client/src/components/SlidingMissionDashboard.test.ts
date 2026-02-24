import { describe, it, expect } from "vitest";

describe("SlidingMissionDashboard", () => {
  it("should calculate correct progress percentage", () => {
    const missions = [
      { progress: 7250, target: 10000 },
      { progress: 6, target: 7 },
      { progress: 1.5, target: 2 },
    ];

    const totalProgress = missions.reduce((acc, m) => acc + m.progress, 0);
    const totalTarget = missions.reduce((acc, m) => acc + m.target, 0);
    const progressPercentage = Math.round((totalProgress / totalTarget) * 100);

    expect(totalProgress).toBe(14750);
    expect(totalTarget).toBe(19000);
    expect(progressPercentage).toBe(78);
  });

  it("should calculate individual mission progress", () => {
    const mission = { progress: 7250, target: 10000 };
    const missionProgress = Math.round((mission.progress / mission.target) * 100);

    expect(missionProgress).toBe(73);
  });

  it("should detect completed missions", () => {
    const missions = [
      { id: "1", progress: 10000, target: 10000 },
      { id: "2", progress: 6, target: 7 },
      { id: "3", progress: 2, target: 2 },
    ];

    const completedMissions = missions.filter(
      (m) => (m.progress / m.target) * 100 === 100
    );

    expect(completedMissions).toHaveLength(2);
    expect(completedMissions[0].id).toBe("1");
    expect(completedMissions[1].id).toBe("3");
  });

  it("should calculate reward points correctly", () => {
    const missions = [
      { reward: 100 },
      { reward: 150 },
      { reward: 50 },
    ];

    const totalReward = missions.reduce((acc, m) => acc + m.reward, 0);

    expect(totalReward).toBe(300);
  });
});
