import { useState } from 'react';
import { Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Gender = 'male' | 'female';
export type AgeGroup = '40s' | '50s' | '60s';
export type AvatarType = 'default' | 'avatar' | 'photo';

export interface AvatarConfig {
  type: AvatarType;
  gender?: Gender;
  ageGroup?: AgeGroup;
  photoUrl?: string;
  name: string;
}

interface AvatarSelectorProps {
  onSelect: (config: AvatarConfig) => void;
  currentConfig?: AvatarConfig;
  userName?: string;
}

const MALE_AVATARS = {
  '40s': '👨‍💼',
  '50s': '👨‍🦱',
  '60s': '👴'
};

const FEMALE_AVATARS = {
  '40s': '👩‍💼',
  '50s': '👩‍🦱',
  '60s': '👵'
};

export default function AvatarSelector({ onSelect, currentConfig, userName = '사용자' }: AvatarSelectorProps) {
  const [selectedType, setSelectedType] = useState<AvatarType>(currentConfig?.type || 'default');
  const [selectedGender, setSelectedGender] = useState<Gender>(currentConfig?.gender || 'male');
  const [selectedAge, setSelectedAge] = useState<AgeGroup>(currentConfig?.ageGroup || '40s');
  const [photoUrl, setPhotoUrl] = useState<string>(currentConfig?.photoUrl || '');
  const [displayName, setDisplayName] = useState<string>(currentConfig?.name || userName);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 미리보기
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setPreviewPhoto(url);
      setPhotoUrl(url);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    const config: AvatarConfig = {
      type: selectedType,
      name: displayName,
      ...(selectedType === 'avatar' && {
        gender: selectedGender,
        ageGroup: selectedAge
      }),
      ...(selectedType === 'photo' && {
        photoUrl: photoUrl
      })
    };
    onSelect(config);
  };

  const getPreviewEmoji = () => {
    if (selectedType === 'default') return '😊';
    if (selectedType === 'photo') return previewPhoto ? '📷' : '📸';
    const avatars = selectedGender === 'male' ? MALE_AVATARS : FEMALE_AVATARS;
    return avatars[selectedAge];
  };

  return (
    <div className="space-y-6">
      {/* 미리보기 */}
      <div className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
        <div className="text-6xl">{getPreviewEmoji()}</div>
        <div className="text-center">
          <p className="font-bold text-lg">{displayName}</p>
          <p className="text-xs text-muted-foreground">
            {selectedType === 'default' && '기본 아바타'}
            {selectedType === 'avatar' && `${selectedGender === 'male' ? '남성' : '여성'} - ${selectedAge === '40s' ? '40대' : selectedAge === '50s' ? '50대' : '60대'}`}
            {selectedType === 'photo' && '사진 아바타'}
          </p>
        </div>
      </div>

      {/* 아바타 타입 선택 */}
      <div>
        <h3 className="font-bold text-sm mb-3">아바타 타입</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: 'default' as const, label: '기본', icon: '😊' },
            { type: 'avatar' as const, label: '캐릭터', icon: '👤' },
            { type: 'photo' as const, label: '사진', icon: '📷' }
          ].map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedType(option.type)}
              className={`py-3 px-2 rounded-lg border-2 transition-all text-center ${
                selectedType === option.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-xs font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 캐릭터 아바타 선택 */}
      {selectedType === 'avatar' && (
        <>
          <div>
            <h3 className="font-bold text-sm mb-3">성별</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { gender: 'male' as const, label: '남성' },
                { gender: 'female' as const, label: '여성' }
              ].map((option) => (
                <button
                  key={option.gender}
                  onClick={() => setSelectedGender(option.gender)}
                  className={`py-3 rounded-lg border-2 transition-all font-medium ${
                    selectedGender === option.gender
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-3">연령대</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { age: '40s' as const, label: '40대', emoji: selectedGender === 'male' ? '👨‍💼' : '👩‍💼' },
                { age: '50s' as const, label: '50대', emoji: selectedGender === 'male' ? '👨‍🦱' : '👩‍🦱' },
                { age: '60s' as const, label: '60대', emoji: selectedGender === 'male' ? '👴' : '👵' }
              ].map((option) => (
                <button
                  key={option.age}
                  onClick={() => setSelectedAge(option.age)}
                  className={`py-3 rounded-lg border-2 transition-all ${
                    selectedAge === option.age
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 사진 업로드 */}
      {selectedType === 'photo' && (
        <div>
          <h3 className="font-bold text-sm mb-3">사진 업로드</h3>
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-all">
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">사진을 선택하세요</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
          {previewPhoto && (
            <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden">
              <img src={previewPhoto} alt="미리보기" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}

      {/* 이름 변경 */}
      <div>
        <h3 className="font-bold text-sm mb-3">이름</h3>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="이름을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 확인 버튼 */}
      <Button
        onClick={handleConfirm}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        아바타 설정 완료
      </Button>
    </div>
  );
}
