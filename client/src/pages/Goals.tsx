import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { Target, Plus, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Goals() {
  const { data: goals, isLoading } = trpc.goals.list.useQuery(undefined, { retry: false });
  const createGoal = trpc.goals.create.useMutation({
    onSuccess: () => {
      toast.success("목표가 생성되었습니다!");
      utils.goals.list.invalidate();
      setOpen(false);
    },
    onError: () => toast.error("목표 생성에 실패했습니다."),
  });
  const updateGoal = trpc.goals.update.useMutation({
    onSuccess: () => {
      toast.success("목표가 업데이트되었습니다!");
      utils.goals.list.invalidate();
    },
  });
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    targetValue: "",
    unit: "",
    category: "weight",
    deadline: "",
  });

  const activeGoals = goals?.filter((g: any) => g.status === "active") || [];
  const completedGoals = goals?.filter((g: any) => g.status === "completed") || [];

  const handleCreate = () => {
    createGoal.mutate({
      title: form.title,
      description: form.description || undefined,
      targetValue: form.targetValue ? parseFloat(form.targetValue) : undefined,
      unit: form.unit || undefined,
      category: form.category,
      deadline: form.deadline || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            건강 목표
          </h1>
          <p className="text-xs text-muted-foreground">개인별 건강 목표를 설정하고 추적하세요</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-warm text-white border-0 text-xs">
              <Plus className="w-3 h-3 mr-1" /> 목표 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-sm">새 건강 목표</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">목표 제목</Label>
                <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="예: 체중 5kg 감량" className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs">카테고리</Label>
                <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                  <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">체중 관리</SelectItem>
                    <SelectItem value="exercise">운동</SelectItem>
                    <SelectItem value="sleep">수면</SelectItem>
                    <SelectItem value="nutrition">영양</SelectItem>
                    <SelectItem value="mental">정신건강</SelectItem>
                    <SelectItem value="custom">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">목표 수치</Label>
                  <Input type="number" value={form.targetValue} onChange={(e) => setForm({...form, targetValue: e.target.value})} placeholder="65" className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">단위</Label>
                  <Input value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} placeholder="kg" className="mt-1 text-sm" />
                </div>
              </div>
              <div>
                <Label className="text-xs">목표 기한</Label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} className="mt-1 text-sm" />
              </div>
              <Button onClick={handleCreate} className="w-full gradient-warm text-white border-0" disabled={!form.title || createGoal.isPending}>
                {createGoal.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                목표 생성
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Goals */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> 진행 중인 목표
        </h2>
        {activeGoals.length > 0 ? (
          <div className="space-y-3">
            {activeGoals.map((goal: any, i: number) => {
              const progressPercent = goal.targetValue
                ? Math.min(100, Math.round(((goal.currentValue || 0) / goal.targetValue) * 100))
                : 0;
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Card className="shadow-sm border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold">{goal.title}</h3>
                        <span className="text-xs text-primary font-bold">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2 mb-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                        </span>
                        {goal.deadline && <span>마감: {goal.deadline}</span>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[10px] h-7 flex-1"
                          onClick={() => {
                            const newVal = parseFloat(prompt("현재 값을 입력하세요:") || "0");
                            if (newVal) updateGoal.mutate({ goalId: goal.id, currentValue: newVal });
                          }}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" /> 진행 업데이트
                        </Button>
                        {progressPercent >= 100 && (
                          <Button
                            size="sm"
                            className="text-[10px] h-7 bg-green-600 text-white"
                            onClick={() => updateGoal.mutate({ goalId: goal.id, status: "completed" })}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> 완료
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">설정된 목표가 없습니다.</p>
            <p className="text-xs mt-1">건강 목표를 추가해보세요.</p>
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> 달성한 목표
          </h2>
          <div className="space-y-2">
            {completedGoals.map((goal: any) => (
              <Card key={goal.id} className="shadow-sm border-border/50 opacity-80">
                <CardContent className="p-3 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">{goal.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {goal.targetValue} {goal.unit} 달성
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
