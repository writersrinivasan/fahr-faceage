import type { Features } from "@/lib/toyModel";

const SKIN = ["#f6d5bd", "#e9b994", "#c98d64", "#9b6545", "#6b4430"];
const HAIR_YOUNG = ["#3b2a20", "#5a3b22", "#1f1a17", "#7a4a26", "#2a2420"];

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

export default function FaceAvatar({
  f, skin = 0, sex = "f", brightness = 0, blur = 0, size = 220, showBox = false, landmarks = false, bg = true,
}: {
  f: Features; skin?: number; sex?: "f" | "m"; brightness?: number; blur?: number; size?: number; showBox?: boolean; landmarks?: boolean; bg?: boolean;
}) {
  const skinC = SKIN[skin % SKIN.length];
  const line = mix(skinC, "#5b3a2a", 0.45);
  const hairC = mix(HAIR_YOUNG[skin % HAIR_YOUNG.length], "#e4e4ea", f.grey);
  const sag = f.sag * 8;
  const filter = `brightness(${1 + brightness * 0.6}) blur(${blur * 2.5}px)`;
  const w = Math.round(f.wrinkles * 4);
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1} style={{ filter }} aria-label="Synthetic face illustration">
      {bg && <rect width="200" height="220" rx="18" fill="#efeaff" />}
      {/* back hair */}
      {sex === "f" && <path d={`M40 95 Q38 ${170 - (1 - f.hair) * 30} 60 ${185 - (1 - f.hair) * 30} L140 ${185 - (1 - f.hair) * 30} Q162 ${170 - (1 - f.hair) * 30} 160 95Z`} fill={hairC} />}
      {/* neck */}
      <rect x="82" y="165" width="36" height="40" fill={mix(skinC, "#000000", 0.08)} />
      <path d="M40 220 Q100 185 160 220" fill="#8b5cf6" />
      {/* head */}
      <path d={`M45 105 Q45 40 100 40 Q155 40 155 105 Q155 ${150 + sag} ${125 + sag * 0.3} ${172 + sag * 0.5} Q100 ${184 + sag * 0.4} ${75 - sag * 0.3} ${172 + sag * 0.5} Q45 ${150 + sag} 45 105Z`} fill={skinC} />
      {/* ears */}
      <ellipse cx="44" cy="110" rx="7" ry="13" fill={skinC} /><ellipse cx="156" cy="110" rx="7" ry="13" fill={skinC} />
      {/* hair top */}
      <path d={`M42 ${100 - f.hair * 5} Q${46} ${30 - f.hair * 10} 100 ${30 - f.hair * 8} Q${154} ${30 - f.hair * 10} 158 ${100 - f.hair * 5} Q150 ${62 + (1 - f.hair) * 10} 100 ${60 + (1 - f.hair) * 14} Q50 ${62 + (1 - f.hair) * 10} 42 ${100 - f.hair * 5}Z`} fill={hairC} opacity={0.35 + f.hair * 0.65} />
      {/* forehead lines */}
      {Array.from({ length: w }).map((_, i) => (
        <path key={i} d={`M72 ${76 + i * 5} Q100 ${72 + i * 5} 128 ${76 + i * 5}`} stroke={line} strokeWidth="1" fill="none" opacity={0.5 + f.wrinkles * 0.4} />
      ))}
      {/* brows */}
      <path d="M66 92 Q78 86 90 92 M110 92 Q122 86 134 92" stroke={hairC} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* eyes */}
      <ellipse cx="78" cy="104" rx="7" ry={4 - f.sag * 1.2} fill="#fff" /><ellipse cx="122" cy="104" rx="7" ry={4 - f.sag * 1.2} fill="#fff" />
      <circle cx="78" cy="104" r="3" fill="#2b2b3a" /><circle cx="122" cy="104" r="3" fill="#2b2b3a" />
      {/* eyelid droop */}
      <path d={`M70 ${101} Q78 ${97 + f.sag * 4} 86 ${101} M114 101 Q122 ${97 + f.sag * 4} 130 101`} stroke={line} strokeWidth="1.3" fill="none" />
      {/* under-eye bags */}
      <path d="M70 111 Q78 116 86 111 M114 111 Q122 116 130 111" stroke={line} strokeWidth={0.6 + f.bags * 1.6} fill="none" opacity={f.bags} />
      <ellipse cx="78" cy="114" rx="9" ry="4" fill={mix(skinC, "#6d4c7d", 0.35)} opacity={f.bags * 0.5} />
      <ellipse cx="122" cy="114" rx="9" ry="4" fill={mix(skinC, "#6d4c7d", 0.35)} opacity={f.bags * 0.5} />
      {/* crow's feet */}
      {f.wrinkles > 0.3 && <path d="M88 102 L93 99 M88 105 L94 105 M88 108 L93 111 M112 102 L107 99 M112 105 L106 105 M112 108 L107 111" transform="translate(-0) " stroke={line} strokeWidth="0.9" opacity={f.wrinkles} />}
      {/* nose */}
      <path d="M100 106 L95 134 Q100 138 106 134" stroke={line} strokeWidth="1.8" fill="none" />
      {/* nasolabial folds */}
      <path d={`M90 132 Q80 ${148 + sag} ${84} ${160 + sag}`} stroke={line} strokeWidth={0.5 + f.wrinkles * 1.4} fill="none" opacity={0.2 + f.wrinkles * 0.8} />
      <path d={`M110 132 Q120 ${148 + sag} ${116} ${160 + sag}`} stroke={line} strokeWidth={0.5 + f.wrinkles * 1.4} fill="none" opacity={0.2 + f.wrinkles * 0.8} />
      {/* mouth */}
      <path d={`M86 ${150 + sag * 0.4} Q100 ${156 + sag * 0.2 - f.sag * 4} 114 ${150 + sag * 0.4}`} stroke="#a5523f" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* jowls */}
      <path d={`M62 ${150 + sag} Q66 ${165 + sag} 76 ${170 + sag * 0.6} M138 ${150 + sag} Q134 ${165 + sag} 124 ${170 + sag * 0.6}`} stroke={line} strokeWidth="1" fill="none" opacity={f.sag} />
      {/* pigment spots */}
      {[[64, 88], [134, 126], [70, 130], [128, 84], [112, 70], [60, 118]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill={mix(skinC, "#6b3f22", 0.5)} opacity={f.spots > i / 6 ? 0.7 : 0} />
      ))}
      {showBox && <rect x="38" y="40" width="124" height="148" fill="none" stroke="#d946ef" strokeWidth="2.5" rx="4" />}
      {landmarks && [[78, 104], [122, 104], [100, 130], [87, 150], [113, 150]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#22d3ee" stroke="#fff" strokeWidth="1.5" />
      ))}
    </svg>
  );
}
