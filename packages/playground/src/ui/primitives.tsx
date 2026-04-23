import styled, { css, keyframes } from "styled-components";

const enter = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Page = styled.div`
  min-height: 100vh;
  padding: 22px;
`;

export const Shell = styled.div`
  margin: 0 auto;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 18px;
  min-width: 0;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  min-width: 0;
`;

export const Sidebar = styled(Panel)`
  padding: 16px;
  position: sticky;
  top: 18px;
  height: fit-content;
  min-width: 0;

  @media (max-width: 880px) {
    position: static;
  }
`;

export const Main = styled(Panel)`
  padding: 18px;
  animation: ${enter} 260ms ease-out;
  min-width: 0;
`;

export const Brand = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

export const Wordmark = styled.div`
  font-family: ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, serif;
  font-weight: 750;
  font-size: 20px;
  letter-spacing: 0.2px;
`;

export const Tagline = styled.div`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 12px;
`;

export const MobileOnly = styled.div`
  display: none;

  @media (max-width: 880px) {
    display: block;
  }
`;

export const DesktopOnly = styled.div`
  @media (max-width: 880px) {
    display: none;
  }
`;

export const H2 = styled.h2`
  margin: 0;
  font-size: 16px;
  letter-spacing: 0.2px;
`;

export const H3 = styled.h3`
  margin: 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.color.textMuted};
`;

export const P = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.color.textMuted};
`;

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.color.border};
  margin: 14px 0;
`;

export const Stack = styled.div<{ $gap?: number }>`
  display: grid;
  gap: ${({ $gap }) => $gap ?? 10}px;
  min-width: 0;
`;

export const Row = styled.div<{ $gap?: number }>`
  display: flex;
  gap: ${({ $gap }) => $gap ?? 10}px;
  flex-wrap: wrap;
  align-items: center;
  min-width: 0;
`;

export const Pills = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.surfaceMuted};
  font-size: 12px;
  color: ${({ theme }) => theme.color.accentText};
`;

export const Button = styled.button<{ $variant?: "primary" | "ghost" | "danger" }>`
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: 9px 12px;
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;

  &:active {
    transform: translateY(1px);
  }

  &:hover {
    box-shadow: 0 10px 28px rgba(12, 12, 13, 0.10);
  }

  ${({ $variant, theme }) =>
    $variant === "primary" &&
    css`
      background: ${theme.color.accent};
      border-color: rgba(0, 0, 0, 0);
      color: #ffffff;
    `}

  ${({ $variant, theme }) =>
    $variant === "ghost" &&
    css`
      background: ${theme.color.surfaceMuted};
    `}

  ${({ $variant, theme }) =>
    $variant === "danger" &&
    css`
      background: ${theme.color.dangerBg};
      border-color: rgba(180, 35, 24, 0.25);
      color: ${theme.color.danger};
    `}
`;

export const NavButton = styled(Button)<{ $active?: boolean }>`
  width: 100%;
  justify-content: space-between;
  display: flex;
  align-items: center;
  text-align: left;
  gap: 10px;
  padding: 10px 12px;
  min-width: 0;

  ${({ $active, theme }) =>
    $active &&
    css`
      border-color: rgba(15, 118, 110, 0.35);
      background: rgba(15, 118, 110, 0.10);
      box-shadow: 0 10px 28px rgba(15, 118, 110, 0.10);
    `}
`;

export const NavMeta = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

export const NavTitle = styled.div`
  font-weight: 700;
  font-size: 13px;
  overflow-wrap: anywhere;
`;

export const NavDesc = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.textMuted};
  overflow-wrap: anywhere;
`;

export const Select = styled.select`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: 10px 12px;
  background: ${({ theme }) => theme.color.surface};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  margin-top: 14px;
  min-width: 0;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background: ${({ theme }) => theme.color.surface};
  padding: 14px;
  min-width: 0;
`;

export const CodeBlock = styled.pre`
  margin: 10px 0 0;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background: ${({ theme }) => theme.color.codeBg};
  color: ${({ theme }) => theme.color.codeText};
  overflow: auto;
  font-size: 12px;
  line-height: 1.45;
  max-width: 100%;
  min-width: 0;
  white-space: pre-wrap;
  word-break: break-word;

  code {
    white-space: inherit;
  }
`;

export const Small = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.textMuted};
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.45;
`;

export const List = styled.ul`
  margin: 10px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
`;

export const ListItem = styled.li`
  font-size: 12px;
  color: ${({ theme }) => theme.color.textMuted};
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.45;
`;

export const Callout = styled.div<{ $tone?: "info" | "danger" }>`
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 12px;

  ${({ $tone, theme }) =>
    $tone === "danger" &&
    css`
      background: ${theme.color.dangerBg};
      border-color: rgba(180, 35, 24, 0.25);
    `}

  ${({ $tone, theme }) =>
    (!$tone || $tone === "info") &&
    css`
      background: ${theme.color.surfaceMuted};
    `}
`;
