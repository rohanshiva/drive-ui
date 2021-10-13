import Editor from "react-simple-code-editor";
import styled from "@emotion/styled";
import { highlight, languages } from "prismjs/components/prism-core";
import React, { useState } from "react";

import "../utils/includedLanguages";

const styles = {
  root: {
    boxSizing: "border-box",
    fontSize: "12px",
    fontFamily: '"Dank Mono", "Fira Code", monospace',
    outline: "none",
    border: "none",
  },
};

const editorContainerStyle = (width, height) => {
  return { width, height, overflowY: "scroll" };
};
export default function EditorComponent(props) {
  const [code, setCode] = useState(props.code);

  return (
    <div style={editorContainerStyle(props.width, props.height)}>
      <Editor
        value={code}
        onValueChange={(code) => {
          setCode(code);
          if (props.onChange) {
            props.onChange(code);
          }
        }}
        highlight={(code) => highlight(code, languages[props.options.language])}
        padding={10}
        readOnly={props.options.readOnly}
        style={styles.root}
        textareaClassName="editor"
      />
    </div>
  );
}
