/** 悬停激活：面积 +20% → scale √1.2 */
export const PANEL_ACTIVE_SCALE = 1.095;

export type PanelMotion = {
  x: number;
  y: number;
  scale: number;
  zIndex: number;
};

const IDLE: PanelMotion = { x: 0, y: 0, scale: 1, zIndex: 0 };

/** 网格单元中心（col 可为 0.5 表示跨列居中项） */
function cellCenter(index: number, total: number, columns: number) {
  const isLoneLast = index === total - 1 && total % 2 === 1 && columns > 1;
  const row = Math.floor(index / columns);
  if (isLoneLast) {
    return { row, col: (columns - 1) / 2 };
  }
  return { row, col: index % columns };
}

/**
 * 根据当前悬停项，计算每个板块的平移/缩放。
 * 邻近项沿远离悬停中心的方向微微让位，形成挤压动力学感。
 */
export function computePanelMotion(
  index: number,
  hoveredIndex: number | null,
  total: number,
  columns: 1 | 2 = 2
): PanelMotion {
  if (hoveredIndex === null) return IDLE;

  if (index === hoveredIndex) {
    return { x: 0, y: 0, scale: PANEL_ACTIVE_SCALE, zIndex: 20 };
  }

  const pos = cellCenter(index, total, columns);
  const hover = cellCenter(hoveredIndex, total, columns);

  let dc = pos.col - hover.col;
  let dr = pos.row - hover.row;
  const dist = Math.hypot(dc, dr);
  if (dist < 0.01) return IDLE;

  dc /= dist;
  dr /= dist;

  // 距离越近，让位幅度越大（反比衰减）
  const influence = 1 / (dist * dist + 0.45);
  const pushX = 40 * Math.min(influence, 1);
  const pushY = 35 * Math.min(influence, 1);

  return {
    x: dc * pushX,
    y: dr * pushY,
    scale: 1,
    zIndex: 5,
  };
}
