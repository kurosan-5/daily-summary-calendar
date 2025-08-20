export const getScoreColor = (score: number | null): string => {
  if (score === null) return '#f5f5f5';
  
  // スコア別の色設定
  const scoreColors: { [key: number]: string } = {
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
  
  return scoreColors[Math.round(score)] || '#f5f5f5';
};

export const getScoreTextColor = (score: number | null): string => {
  if (score === null) return '#666';
  
  // 暗い背景色や豪華な色に対して白文字、明るい色に対して黒文字
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
