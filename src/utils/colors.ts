export const getScoreColor = (score: number | null, isDark: boolean = false): string => {
  if (score === null) return isDark ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5';
  
  if (isDark) {
    // ダークモード用の色設定
    const darkScoreColors: { [key: number]: string } = {
      1: '#424242',   // 地味なダークグレー
      2: '#565656',   // 少し明るいダークグレー
      3: '#7d6b47',   // 地味なダークベージュ
      4: '#8d7a5c',   // 明るめのダークベージュ
      5: '#4a6fa5',   // ダーク水色
      6: '#5ab894ff',   // ダーク薄緑
      7: '#d6a017ff',   // ダーク金色
      8: '#d47c00ff',   // ダークオレンジ
      9: '#a512e4ff',   // ダーク紫
      10: '#ffba0bff'   // ダークゴールド
    };
    return darkScoreColors[Math.round(score)] || (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5');
  }
  
  // ライトモード用の色設定（既存）
  const lightScoreColors: { [key: number]: string } = {
    1: '#8d8d8d',   // 地味なグレー
    2: '#a5a5a5',   // 少し明るいグレー
    3: '#c4a17a',   // 地味なベージュ
    4: '#d4b896',   // 明るめのベージュ
    5: '#87ceeb',   // 普通の水色
    6: '#98d8c8',   // 普通の薄緑
    7: '#ffd700',   // 明るい金色
    8: '#ff9500',   // 明るいオレンジ
    9: '#9c27b0',   // 豪華な紫
    10: '#d4af37'   // 高級感のあるゴールド
  };
  
  return lightScoreColors[Math.round(score)] || '#f5f5f5';
};

export const getScoreTextColor = (score: number | null, isDark: boolean = false): string => {
  if (score === null) return isDark ? '#fff' : '#666';
  
  if (isDark) {
    // ダークモードでは基本的に白文字
    return '#fff';
  }
  
  // ライトモードでの設定（既存）
  const whiteTextScores = [1, 2, 9]; // グレー系と紫
  return whiteTextScores.includes(Math.round(score)) ? '#fff' : '#000';
};

export const getScoreGrade = (score: number): string => {
  if (score >= 9) return 'S';
  if (score >= 7) return 'A';
  if (score >= 5) return 'B';
  if (score >= 3) return 'C';
  return 'D';
};
