// 캐릭터 그림: assets/characters/{캐릭터id}_{색id}.png (배경 투명)
// 원본은 오리 님이 ChatGPT로 만든 미디어 친구들, 색 바꾼 버전은 코드로 만듦
import { CHARACTERS } from "./data.js";

// 미리보기 파일은 그림을 window.CHAR_DATA 에 담아 둠
export const charSrc = (id, color) => window.CHAR_DATA?.[`${id}_${color}`] || `assets/characters/${id}_${color}.png`;
export const charName = id => (CHARACTERS.find(c => c.id === id) || CHARACTERS[0]).name;

export function charEl(id, color, cls = "char") {
  const img = new Image();
  img.className = cls; img.alt = charName(id); img.draggable = false;
  img.src = charSrc(id, color);
  return img;
}
