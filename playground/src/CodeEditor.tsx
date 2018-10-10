import * as React from 'react';
import * as monacoEditor from 'monaco-editor';
import { FlexColDiv } from './FlexDivs';

export interface ITextRange {
  /**
   * Beginning position as a character index of the text in the editor
   */
  pos: number;

  /**
   * End position as a character index of the text in the editor
   */
  end: number;
}

/**
 * Describes a marker. Markers refer to annotations (i.e. - squiggly lines) in code.
 */
export interface ISyntaxMarker extends ITextRange {
  message: string;
}

/**
 * Describes a styled range. This allows CSS styling to be applied to ranges of code.
 */
export interface IStyledRange extends ITextRange {
  className: string;
}

export interface ICodeEditorProps {
  className?: string;
  style?: React.CSSProperties;
  value?: string;
  readOnly?: boolean;
  language?: string;
  onChange?: (value: string) => void;

  editorOptions?: monacoEditor.editor.IEditorConstructionOptions;
  markers?: ISyntaxMarker[];
  syntaxStyles?: IStyledRange[];
}

export interface ICodeEditorState {
  monaco?: typeof monacoEditor;
  monacoErrorMessage?: string;
}

interface IMonacoWindow extends Window {
  require: {
    (paths: string[], callback: (monaco: typeof monacoEditor) => void): void;
    config: (options: { paths: { [name: string]: string } }) => void
  };
  MonacoEnvironment: {
    getWorkerUrl: (workerId: string, label: string) => void;
  };
}

declare const MONACO_URL: string;
const MONACO_BASE_URL: string = MONACO_URL;

export class CodeEditor extends React.Component<ICodeEditorProps, ICodeEditorState> {
  private static _initializePromise: Promise<typeof monacoEditor>;
  private static _editorIdCounter: number = 0;
  private static _monaco: typeof monacoEditor;

  private _existingSyntaxStyles: { [hash: string]: string } = {};
  private _editorId: string;
  private _isMounted: boolean;
  private _editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;

  private _placeholderDivRef: HTMLDivElement | undefined;
  private  _hostDivref: HTMLDivElement | undefined;

  private get _value(): string | undefined {
    if (this._editor) {
      return this._editor.getValue();
    } else {
      return undefined;
    }
  }

  private static _initializeMonaco(): Promise<typeof monacoEditor> {
    if (!CodeEditor._initializePromise) {
      CodeEditor._initializePromise = new Promise(
        (resolve: (monaco: typeof monacoEditor) => void, reject: (error: Error) => void ) => {
          const monacoWindow: IMonacoWindow = window as IMonacoWindow;
          monacoWindow.require.config({ paths: { 'vs': `${MONACO_BASE_URL}vs/` }});

          monacoWindow.MonacoEnvironment = {
            getWorkerUrl: (workerId, label) => {
              return `data:text/javascript;charset=utf-8,${encodeURIComponent(
                'self.MonacoEnvironment = {' +
                  `baseUrl: '${MONACO_BASE_URL}'` +
                '};' +
                `importScripts('${MONACO_BASE_URL}vs/base/worker/workerMain.js');`
              )}`;
            }
          };

          monacoWindow.require(['vs/editor/editor.main'], (monaco) => {
            if (monaco) {
              resolve(monaco);
            } else {
              reject(new Error('Unable to load Monaco editor'));
            }
          });
        }
      ).then((monaco) => CodeEditor._monaco = monaco);
    }

    return CodeEditor._initializePromise;
  }

  constructor(props: ICodeEditorProps) {
    super(props);

    this._editorId = `tsdoc-monaco-${CodeEditor._editorIdCounter++}`;
    this.state = {};
    this._onWindowResize = this._onWindowResize.bind(this);
  }

  public componentDidMount(): void {
    this._isMounted = true;
    CodeEditor._initializeMonaco().then((monaco) => {
      this.setState({ monaco });
      if (this._isMounted) {
        window.addEventListener('resize', this._onWindowResize);
      }
    }).catch((error) => {
      this.setState({ monacoErrorMessage: `Error loading Monaco editor: ${error}` });
    });
  }

  public componentWillUnmount(): void {
    this._isMounted = false;
    this._editor = undefined;

    this._placeholderDivRef = undefined;
    this._hostDivref = undefined;

    window.removeEventListener('resize', this._onWindowResize);
  }

  public componentDidUpdate(prevProps: ICodeEditorProps): void {
    if (this._editor) {
      if (this._value !== this.props.value) {
        this._editor.setValue(this.props.value || '');
      }

      if (CodeEditor._monaco) {
        CodeEditor._monaco.editor.setModelMarkers(
          this._editor.getModel(),
          this._editorId,
          (this.props.markers || []).map((marker) => {
            const startPos: monacoEditor.Position = this._editor!.getModel().getPositionAt(marker.pos);
            const endPos: monacoEditor.Position = this._editor!.getModel().getPositionAt(marker.end);
            return {
              startLineNumber: startPos.lineNumber,
              startColumn: startPos.column,
              endLineNumber: endPos.lineNumber,
              endColumn: endPos.column,
              severity: CodeEditor._monaco.MarkerSeverity.Error,
              message: marker.message
            };
          })
        );
      }

      this._applySyntaxStyling(this.props.syntaxStyles || []);
    }
  }

  public render(): React.ReactNode {
    if (this.state.monacoErrorMessage) {
      return ( // Fall back to a textbox
        <FlexColDiv
          className={ this.props.className }>
          { this.state.monacoErrorMessage }
        </FlexColDiv>
        );
    } else {
      // The Monaco application is very complex and its div does not resize reliably.
      // To work around this, we render a blank placeholder div (that is well-behaved),
      // and then the Monaco host div floats above that using absolute positioning
      // and manual resizing.
      return (
        <div className='playground-monaco-placeholder'
          ref={ (element: HTMLDivElement) => { this._placeholderDivRef = element; } }>

          <div className='playground-monaco-host'
          ref={ (element: HTMLDivElement) => { this._hostDivref = element; this._createEditor(); } }/>

        </div>
      );
    }
  }

  private _applySyntaxStyling(newSyntaxStyles: IStyledRange[]): void {
    if (this._editor) {
      // Find decorations to remove
      const newExistingSyntaxStyles: { [hash: string]: string } = {};
      const decorationsToAdd: IStyledRange[] = [];
      const hashesOfFecorationsToAdd: string[] = [];
      const decorationsToRemove: string[] = [];
      for (const syntaxStyle of newSyntaxStyles) {
        const hash: string = JSON.stringify(syntaxStyle);

        if (this._existingSyntaxStyles[hash] !== undefined) {
          newExistingSyntaxStyles[hash] = this._existingSyntaxStyles[hash];
          delete this._existingSyntaxStyles[hash];
        } else {
          newExistingSyntaxStyles[hash] = ''; // Put an empty identifier here so we don't add duplicates
          hashesOfFecorationsToAdd.push(hash);
          decorationsToAdd.push(syntaxStyle);
        }
      }

      for (const hash in this._existingSyntaxStyles) {
        if (this._existingSyntaxStyles.hasOwnProperty(hash)) {
          const decorationId: string = this._existingSyntaxStyles[hash];
          decorationsToRemove.push(decorationId);
        }
      }

      this._editor.getModel().deltaDecorations(decorationsToRemove, []);
      const decorationIds: string[] = this._editor.getModel().deltaDecorations([], decorationsToAdd.map(
        (decoration) => {
          const startPos: monacoEditor.Position = this._editor!.getModel().getPositionAt(decoration.pos);
          const endPos: monacoEditor.Position = this._editor!.getModel().getPositionAt(decoration.end);

          return {
            range: new CodeEditor._monaco.Range(
              startPos.lineNumber,
              startPos.column,
              endPos.lineNumber,
              endPos.column
            ),
            options: {
              stickiness: CodeEditor._monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
              isWholeLine: false,
              inlineClassName: decoration.className
            }
          };
        }
      ));

      for (let i: number = 0; i < decorationsToAdd.length; i++) {
        newExistingSyntaxStyles[hashesOfFecorationsToAdd[i]] = decorationIds[i];
      }

      this._existingSyntaxStyles = newExistingSyntaxStyles;
    }
  }

  private _safeOnChange(newValue: string): void {
    if (this.props.onChange) {
      try {
        this.props.onChange(newValue);
      } catch (e) {
        console.error(`Error in onChange callback: ${e}`);
      }
    }
  }

  private _createEditor(): void {
    CodeEditor._initializeMonaco().then((monaco) => {
      if (!this._editor && this._hostDivref) {
        this._editor = monaco.editor.create(
          this._hostDivref,
          {
            value: this.props.value || '',
            language: this.props.language,
            readOnly: this.props.readOnly,
            minimap: {
              enabled: false
            },
            ...this.props.editorOptions
          }
        );

        this._editor.getModel().onDidChangeContent((e) => {
          if (this._editor) {
            this._safeOnChange(this._editor.getValue());
          }
        });

        this._onWindowResize();
      }
    });
  }

  private _onWindowResize(): void {
    if (this._placeholderDivRef && this._hostDivref) {
      // Resize the host div to match whatever the browser did for the placeholder div
      this._hostDivref.style.width = this._placeholderDivRef.clientWidth + 'px';
      this._hostDivref.style.height = this._placeholderDivRef.clientHeight + 'px';

      if (this._editor) {
        this._editor.layout();
      }
    }
  }
}
