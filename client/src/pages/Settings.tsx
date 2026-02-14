import { useTranslation } from "@/hooks/useTranslation";
import { useFontScale, FontScale } from "@/hooks/useFontScale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe, Bell, User, LogOut, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { t, language, changeLanguage, languages } = useTranslation();
  const { scale, changeFontScale } = useFontScale();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const fontSizeOptions: { value: FontScale; label: keyof typeof t.settings.fontSizes }[] = [
    { value: 'xs', label: 'verySmall' },
    { value: 'sm', label: 'small' },
    { value: 'base', label: 'normal' },
    { value: 'lg', label: 'large' },
    { value: 'xl', label: 'veryLarge' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-8">
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-sm opacity-90 mt-1">GLWA Wellness</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* 글자 크기 설정 */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🔤</span>
            </div>
            <div>
              <h3 className="font-bold text-base">{t.settings.fontSize}</h3>
              <p className="text-xs text-muted-foreground">
                {t.settings.fontSizes[fontSizeOptions.find(o => o.value === scale)?.label || 'normal']}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => changeFontScale(option.value)}
                className={`py-3 px-2 rounded-lg border-2 transition-all ${
                  scale === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className={`font-bold mb-1 ${
                    option.value === 'xs' ? 'text-xs' :
                    option.value === 'sm' ? 'text-sm' :
                    option.value === 'base' ? 'text-base' :
                    option.value === 'lg' ? 'text-lg' :
                    'text-xl'
                  }`}>
                    A
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {t.settings.fontSizes[option.label]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* 다크 모드 */}
        <Card className="p-5">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                {isDarkMode ? <Moon className="w-5 h-5 text-purple-600" /> : <Sun className="w-5 h-5 text-yellow-600" />}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-base">{t.settings.darkMode}</h3>
                <p className="text-xs text-muted-foreground">
                  {isDarkMode ? "Dark" : "Light"}
                </p>
              </div>
            </div>
            <div className={`w-14 h-8 rounded-full transition-all ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <div className={`w-6 h-6 bg-white rounded-full mt-1 transition-all ${isDarkMode ? 'ml-7' : 'ml-1'}`} />
            </div>
          </button>
        </Card>

        {/* 언어 설정 */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-base">{t.settings.language}</h3>
              <p className="text-xs text-muted-foreground">
                {languages.find(l => l.code === language)?.name}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code as any)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  language === lang.code
                    ? 'bg-green-50 border-2 border-green-500'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* 알림 설정 */}
        <Card className="p-5">
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-base">{t.settings.notifications}</h3>
                <p className="text-xs text-muted-foreground">
                  {notificationsEnabled ? "ON" : "OFF"}
                </p>
              </div>
            </div>
            <div className={`w-14 h-8 rounded-full transition-all ${notificationsEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}>
              <div className={`w-6 h-6 bg-white rounded-full mt-1 transition-all ${notificationsEnabled ? 'ml-7' : 'ml-1'}`} />
            </div>
          </button>
        </Card>

        {/* 계정 관리 */}
        <Card className="p-5">
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-3 transition-all">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{t.settings.profile}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-3 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔒</span>
                <span className="font-medium">{t.settings.privacy}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-3 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-lg">📄</span>
                <span className="font-medium">{t.settings.terms}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </Card>

        {/* 로그아웃 */}
        <Button
          variant="outline"
          className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t.settings.logout}
        </Button>
      </div>
    </div>
  );
}
