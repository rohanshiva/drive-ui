import styled from "@emotion/styled";
import Highlight, { defaultProps } from "prism-react-renderer";
import theme from "prism-react-renderer/themes/github";

import React, { Fragment, useState } from "react";
import Editor from "react-simple-code-editor";

const Container = styled.div`
  width: ${(props) => `${props.theme.width}`};
  height: ${(props) => `${props.theme.height}`};
`;

const Pre = styled.pre`
  text-align: left;
  margin: 1em 0;
  padding: 0.5em;
  overflow: scroll;

  & .token-line {
    line-height: 1.3em;
    height: 1.3em;
  }
`;

const Line = styled.div`
  display: table-row;
`;

const LineNo = styled.span`
  display: table-cell;
  text-align: right;
  padding-right: 1em;
  user-select: none;
  opacity: 0.5;
`;

const LineContent = styled.span`
  display: table-cell;
`;

const styles = {
  root: {
    boxSizing: "border-box",
    fontSize: "12px",
    fontFamily: '"Dank Mono", "Fira Code", monospace',
    ...theme.plain,
  },
};

const generateEditorTheme = (width, height) => {
  styles.root.width = `${width}px`;
  styles.root.height = `${height}px`;
  return styles.root;
};
export default function EditorComponent(props) {
  const [code, setCode] = useState(props.code);

  const highlight = (code) => (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={code}
      language={props.options.language && props.options.language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
        if (props.options.readOnly) {
          return (
            <Pre className={className} style={style}>
              <Container theme={{ width: props.width, height: props.height }}>
                {props.options.lineNumber
                  ? tokens.map((line, i) => (
                      <Line key={i} {...getLineProps({ line, key: i })}>
                        <LineNo>{i + 1}</LineNo>
                        <LineContent>
                          {line.map((token, key) => (
                            <span
                              key={key}
                              {...getTokenProps({ token, key })}
                            />
                          ))}
                        </LineContent>
                      </Line>
                    ))
                  : tokens.map((line, i) => (
                      <div {...getLineProps({ line, key: i })}>
                        {line.map((token, key) => (
                          <span {...getTokenProps({ token, key })} />
                        ))}
                      </div>
                    ))}
              </Container>
            </Pre>
          );
        }
        return (
          <Fragment>
            {tokens.map((line, i) => (
              <div {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </Fragment>
        );
      }}
    </Highlight>
  );

  if (props.options.readOnly) {
    return highlight(code);
  }
  return (
    <Editor
      value={code}
      onValueChange={(code) => setCode(code)}
      highlight={highlight}
      padding={10}
      readOnly={props.options.readOnly}
      style={generateEditorTheme(props.width, props.height)}
    />
  );
}
