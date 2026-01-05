import { useEffect, useRef } from 'react';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

export default function Editor({ value, onChange, language }) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const languageCompartment = useRef(new Compartment());
  const externalUpdateRef = useRef(false);
  const handleChange = onChange || (() => {});

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          oneDark,
          EditorView.lineWrapping,
          languageCompartment.current.of(language === 'python' ? python() : javascript()),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !externalUpdateRef.current) {
              handleChange(update.state.doc.toString());
            }
          })
        ]
      }),
      parent: containerRef.current
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: languageCompartment.current.reconfigure(language === 'python' ? python() : javascript())
    });
  }, [language]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    externalUpdateRef.current = true;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value }
    });
    externalUpdateRef.current = false;
  }, [value]);

  return <div className="editor" ref={containerRef} />;
}
