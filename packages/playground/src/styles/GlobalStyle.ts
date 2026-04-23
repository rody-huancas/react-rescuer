import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
  }

  body {
    margin: 0;
    color: ${({ theme }) => theme.color.text};
    background:
      radial-gradient(1200px 700px at 10% 0%, rgba(15, 118, 110, 0.16) 0%, rgba(246, 242, 234, 0) 60%),
      radial-gradient(900px 700px at 92% 20%, rgba(180, 83, 9, 0.16) 0%, rgba(246, 242, 234, 0) 55%),
      linear-gradient(180deg, ${({ theme }) => theme.color.bg} 0%, ${({ theme }) => theme.color.bgInset} 100%);
    font-family: "Segoe UI Variable Text", "SF Pro Text", "Helvetica Neue", Helvetica, sans-serif;
    line-height: 1.45;
  }

  ::selection {
    background: rgba(15, 118, 110, 0.22);
  }

  a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  button, input, select, textarea {
    font: inherit;
  }

  :focus-visible {
    outline: 3px solid rgba(15, 118, 110, 0.28);
    outline-offset: 2px;
  }
`;
