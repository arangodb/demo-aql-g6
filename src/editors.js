import React from 'react';
import styles from './editors.module.css';
import AceEditor from "react-ace";
import 'ace-builds/src-noconflict/mode-aql';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

export const AqlEditor = ({height, value, onChange}) => {
  return  (
    <div className={styles.editorContainer}>
      <AceEditor
        mode="aql"
        theme="monokai"
        name="AQL"
        value={value}
        onChange={onChange}
        width={"100%"}
        height={height}
        showPrintMargin={false}
        showGutter={true}
        tabSize={2}
        highlightActiveLine={true}
        setOptions={{ useWorker: false }}
      />
    </div>
  );
}

export const JsonEditor = ({height, value, onChange}) => {
  return  (
    <div className={styles.editorContainer}>
      <AceEditor
        mode="json"
        theme="monokai"
        name="JSON"
        value={value}
        onChange={onChange}
        width={"100%"}
        height={height}
        showPrintMargin={false}
        showGutter={false}
        tabSize={2}
        highlightActiveLine={false}
        readOnly={true}
        setOptions={{ useWorker: false }}
      />
    </div>
  );
}

