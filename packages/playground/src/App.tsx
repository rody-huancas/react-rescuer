import { useMemo, useState } from "react";
import { demos, type DemoKey } from "./demos";
import { Brand, Button, DesktopOnly, Divider, Main, MobileOnly, NavButton, NavDesc, NavMeta, NavTitle, Page, Pills, Pill, Row, Select, Shell, Sidebar, Stack, Tagline, Wordmark } from "./ui/primitives";

export const App = () => {
  const [demo, setDemo] = useState<DemoKey>("basic");

  const active = useMemo(
    () => demos.find((d) => d.key === demo) ?? demos[0]!,
    [demo],
  );

  return (
    <Page>
      <Shell>
        <Sidebar>
          <Stack $gap={12}>
            <Brand>
              <Wordmark>react-rescuer</Wordmark>
              <Tagline>playground</Tagline>
            </Brand>

            <div>
              <Tagline>
                Hands-on demos for the ErrorBoundary core, hooks, recovery, and
                observability.
              </Tagline>
            </div>

            <MobileOnly>
              <Select
                value={demo}
                onChange={(e) => setDemo(e.target.value as DemoKey)}
              >
                {demos.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.title}
                  </option>
                ))}
              </Select>
            </MobileOnly>

            <Divider />

            <DesktopOnly>
              <Stack $gap={8}>
                {demos.map((d) => (
                  <NavButton
                    key={d.key}
                    type="button"
                    $active={d.key === demo}
                    onClick={() => setDemo(d.key)}
                  >
                    <NavMeta>
                      <NavTitle>{d.title}</NavTitle>
                      <NavDesc>{d.description}</NavDesc>
                    </NavMeta>
                    <Pills>
                      {d.pills.slice(0, 2).map((p) => (
                        <Pill key={p}>{p}</Pill>
                      ))}
                    </Pills>
                  </NavButton>
                ))}
              </Stack>
            </DesktopOnly>

            <Divider />

            <Row $gap={10}>
              <Button
                type="button"
                $variant="ghost"
                onClick={() => {
                  window.open(
                    "https://github.com/rody-huancas/react-rescuer",
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                Repo
              </Button>
              <Button
                type="button"
                $variant="ghost"
                onClick={() => {
                  window.open(
                    "https://www.npmjs.com/package/react-rescuer",
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                npm
              </Button>
            </Row>
          </Stack>
        </Sidebar>

        <Main>
          <active.Component />
        </Main>
      </Shell>
    </Page>
  );
};
