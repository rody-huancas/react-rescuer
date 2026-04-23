export const theme = {
  color: {
    bg          : "#f6f2ea",
    bgInset     : "#fbfaf7",
    surface     : "#ffffff",
    surfaceMuted: "#fff8ee",
    text        : "#1b1f23",
    textMuted   : "#556070",
    border      : "rgba(27, 31, 35, 0.14)",
    accent      : "#0f766e",
    accentText  : "#0a3b36",
    danger      : "#b42318",
    dangerBg    : "#ffefe8",
    codeBg      : "#0c1220",
    codeText    : "#dce7ff"
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18
  },
  shadow: {
    sm: "0 1px 1px rgba(12, 12, 13, 0.06), 0 8px 24px rgba(12, 12, 13, 0.06)",
    md: "0 2px 2px rgba(12, 12, 13, 0.08), 0 16px 44px rgba(12, 12, 13, 0.10)"
  }
} as const;

export type Theme = typeof theme;
