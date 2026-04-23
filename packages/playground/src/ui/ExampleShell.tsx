import type { ReactNode } from "react";
import { Card, CodeBlock, Divider, Grid, H2, H3, List, ListItem, P, Stack } from "./primitives";

type ApiItem = {
  name  : string;
  detail: string;
};

type ExampleShellProps = {
  title   : string;
  lead    : string;
  imports : string;
  api     : ApiItem[];
  tryIt   : string[];
  children: ReactNode;
};

export const ExampleShell = ({ title, lead, imports, api, tryIt, children }: ExampleShellProps) => {
  return (
    <div>
      <H2>{title}</H2>
      <P>{lead}</P>

      <Grid>
        <Card>
          <Stack $gap={12}>{children}</Stack>
        </Card>

        <Card>
          <Stack $gap={12}>
            <div>
              <H3>Imports</H3>
              <CodeBlock>
                <code>{imports}</code>
              </CodeBlock>
            </div>

            <Divider />

            <div>
              <H3>API Used</H3>
              <List>
                {api.map((item) => (
                  <ListItem key={item.name}>
                    <strong>{item.name}</strong> - {item.detail}
                  </ListItem>
                ))}
              </List>
            </div>

            <Divider />

            <div>
              <H3>Try It</H3>
              <List>
                {tryIt.map((t) => (
                  <ListItem key={t}>{t}</ListItem>
                ))}
              </List>
            </div>
          </Stack>
        </Card>
      </Grid>
    </div>
  );
};
