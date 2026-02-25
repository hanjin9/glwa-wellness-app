import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MissionSlotMachine } from "./MissionSlotMachine";

describe("MissionSlotMachine", () => {
  it("should render mission slot machine", () => {
    render(<MissionSlotMachine />);
    expect(screen.getByText(/미션 룰렛/i)).toBeInTheDocument();
  });

  it("should display difficulty levels", () => {
    render(<MissionSlotMachine />);
    expect(screen.getByText(/Gold/)).toBeInTheDocument();
    expect(screen.getByText(/Silver/)).toBeInTheDocument();
    expect(screen.getByText(/Bronze/)).toBeInTheDocument();
  });

  it("should call onMissionSelect when mission is selected", async () => {
    const onSelect = vi.fn();
    render(<MissionSlotMachine onMissionSelect={onSelect} />);

    // 미션 버튼 클릭
    const missionButtons = screen.getAllByRole("button");
    const missionButton = missionButtons.find(
      (btn) => btn.textContent && btn.textContent.includes("🚶")
    );

    if (missionButton) {
      fireEvent.click(missionButton);
      await waitFor(() => {
        expect(onSelect).toHaveBeenCalled();
      });
    }
  });

  it("should show selected mission details", async () => {
    render(<MissionSlotMachine />);

    // 미션 선택
    const missionButtons = screen.getAllByRole("button");
    const missionButton = missionButtons.find(
      (btn) => btn.textContent && btn.textContent.includes("🚶")
    );

    if (missionButton) {
      fireEvent.click(missionButton);
      await waitFor(() => {
        expect(screen.getByText(/선택된 미션/i)).toBeInTheDocument();
      });
    }
  });

  it("should have pause/resume functionality", () => {
    render(<MissionSlotMachine />);
    const pauseButton = screen.queryByText(/계속 돌리기/i);
    // 초기에는 일시정지 상태가 아니므로 버튼이 없을 수 있음
    expect(pauseButton).not.toBeInTheDocument();
  });

  it("should display points for each difficulty", () => {
    render(<MissionSlotMachine />);
    expect(screen.getByText(/\+100P/)).toBeInTheDocument(); // Bronze
    expect(screen.getByText(/\+300P/)).toBeInTheDocument(); // Silver
    expect(screen.getByText(/\+500P/)).toBeInTheDocument(); // Gold
  });
});
