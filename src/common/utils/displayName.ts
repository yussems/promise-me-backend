// src/common/randomName.ts
import { GALAXY_NAMES, PLANET_NAMES, STARS_NAMES } from "@/constant/names";
import { v4 as uuidv4 } from "uuid";

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// uuid’den sayısal suffix türetelim (0–9999 arası)
function suffixFromUuid() {
  const hex = uuidv4().replace(/-/g, "").slice(0, 6); // ilk 6 karakter
  return (parseInt(hex, 16) % 10000).toString().padStart(4, "0");
}

export function generateRandomName(): string {
  const galaxy = pick(GALAXY_NAMES);
  const star = pick(STARS_NAMES);
  const planet = pick(PLANET_NAMES);

  const patterns = [
    `${galaxy}_${suffixFromUuid()}`,
    `${star}_${suffixFromUuid()}`,
    `${planet}_${suffixFromUuid()}`,
    `${star}_${planet}_${suffixFromUuid()}`,
    `${galaxy}_${star}_${suffixFromUuid()}`,
  ];

  return pick(patterns);
}
