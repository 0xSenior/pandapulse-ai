import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Terminal, Copy, Check, FileCode, Sparkles } from 'lucide-react';

/**
 * VS Code Dark Modern Syntax Color Tokens
 */
const VS_THEME = {
  keyword: 'text-[#c586c0] font-medium',         // import, from, as, def, class, return, if, etc.
  constant: 'text-[#569cd6] font-medium',        // True, False, None
  type: 'text-[#4ec9b0]',                        // int, str, DataFrame, Series, List, Optional
  function: 'text-[#dcdcaa]',                    // concat, loc, iloc, print, len, my_func
  decorator: 'text-[#dcdcaa] italic',            // @dataclass, @property
  string: 'text-[#ce9178]',                      // "string", 'single'
  comment: 'text-[#6a9955] italic',              // # comments
  number: 'text-[#b5cea8]',                      // 100, 3.14, 0
  variable: 'text-[#9cdcfe]',                    // df, x, item_id
  operator: 'text-[#d4d4d4]',                    // =, +, -, *, :=, ->
  punctuation: 'text-[#d4d4d4]',                 // [], (), {}, .
  library: 'text-[#4ec9b0] font-medium',         // pd, np, plt, sns
};

const KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'case', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
  'if', 'import', 'in', 'is', 'lambda', 'match', 'nonlocal', 'not', 'or',
  'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
]);

const CONSTANTS = new Set(['True', 'False', 'None']);

const TYPES = new Set([
  'int', 'float', 'str', 'bool', 'list', 'dict', 'set', 'tuple', 'object', 'type',
  'bytes', 'bytearray', 'memoryview', 'Generator', 'List', 'Dict', 'Set', 'Tuple',
  'Optional', 'Union', 'Any', 'Callable', 'Iterable', 'Iterator', 'DataFrame',
  'Series', 'Index', 'MultiIndex', 'ArrowDtype', 'Timestamp', 'Timedelta',
  'DataMetric', 'CategoricalDtype'
]);

const LIBRARIES = new Set([
  'pandas', 'numpy', 'matplotlib', 'seaborn', 'pyarrow', 'scipy', 'sklearn',
  'pd', 'np', 'plt', 'sns', 'pa', 'sys', 'os', 're', 'math', 'json', 'time',
  'asyncio', 'hashlib', 'dataclass', 'dataclasses', 'field', 'typing'
]);

function highlightLine(line) {
  if (!line) return [<span key="empty">&nbsp;</span>];

  const tokens = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    // 1. Comments: # to end of line
    if (line[i] === '#') {
      tokens.push(
        <span key={`comm-${i}`} className={VS_THEME.comment}>
          {line.slice(i)}
        </span>
      );
      break;
    }

    // 2. Decorators: @something
    if (line[i] === '@' && (i === 0 || /\s/.test(line[i - 1]))) {
      const match = line.slice(i).match(/^@[a-zA-Z_]\w*/);
      if (match) {
        tokens.push(
          <span key={`dec-${i}`} className={VS_THEME.decorator}>
            {match[0]}
          </span>
        );
        i += match[0].length;
        continue;
      }
    }

    // 3. Strings
    const stringPrefixMatch = line.slice(i).match(/^([frbFRB]{1,2})?(f|r|b|fr|rf)?("""|'''|"|')/);
    if (stringPrefixMatch) {
      const prefix = stringPrefixMatch[1] || '';
      const quote = stringPrefixMatch[3];
      const startIdx = i;
      i += prefix.length + quote.length;

      let escaped = false;
      while (i < len) {
        if (escaped) {
          escaped = false;
          i++;
        } else if (line[i] === '\\') {
          escaped = true;
          i++;
        } else if (line.slice(i, i + quote.length) === quote) {
          i += quote.length;
          break;
        } else {
          i++;
        }
      }

      tokens.push(
        <span key={`str-${startIdx}`} className={VS_THEME.string}>
          {line.slice(startIdx, i)}
        </span>
      );
      continue;
    }

    // 4. Numbers
    if (/\d/.test(line[i]) && (i === 0 || !/[a-zA-Z_]/.test(line[i - 1]))) {
      const match = line.slice(i).match(/^\b\d+(\.\d+)?([eE][+-]?\d+)?\b/);
      if (match) {
        tokens.push(
          <span key={`num-${i}`} className={VS_THEME.number}>
            {match[0]}
          </span>
        );
        i += match[0].length;
        continue;
      }
    }

    // 5. Identifiers / Keywords / Function calls / Types
    if (/[a-zA-Z_]/.test(line[i])) {
      const match = line.slice(i).match(/^[a-zA-Z_]\w*/);
      if (match) {
        const word = match[0];
        const nextChar = line[i + word.length];
        const isFollowedByParen = nextChar === '(' || /^\s*\(/.test(line.slice(i + word.length));
        const prevChar = i > 0 ? line[i - 1] : '';

        let style = VS_THEME.variable;

        if (KEYWORDS.has(word)) {
          style = VS_THEME.keyword;
        } else if (CONSTANTS.has(word)) {
          style = VS_THEME.constant;
        } else if (TYPES.has(word)) {
          style = VS_THEME.type;
        } else if (LIBRARIES.has(word)) {
          style = VS_THEME.library;
        } else if (isFollowedByParen) {
          style = VS_THEME.function;
        } else if (prevChar === '.') {
          style = VS_THEME.variable;
        } else if (word === word.toUpperCase() && word.length > 1) {
          style = VS_THEME.constant;
        }

        tokens.push(
          <span key={`ident-${i}`} className={style}>
            {word}
          </span>
        );
        i += word.length;
        continue;
      }
    }

    // 6. Operators & Punctuation
    const opMatch = line.slice(i).match(/^(:=|\->|==|!=|<=|>=|\+=|\-=|\*=|\/=|[\+\-\*\/=><:%&|^~])/);
    if (opMatch) {
      tokens.push(
        <span key={`op-${i}`} className={VS_THEME.operator}>
          {opMatch[0]}
        </span>
      );
      i += opMatch[0].length;
      continue;
    }

    tokens.push(
      <span key={`punct-${i}`} className="text-[#d4d4d4]">
        {line[i]}
      </span>
    );
    i++;
  }

  return tokens;
}

/**
 * Interactive VS Code Dark Modern Code Editor with live syntax highlighting,
 * synchronized line numbers gutter, and tab indentation.
 */
export const VSCodeEditor = ({
  value = '',
  onChange,
  filename = 'pipeline.py',
}) => {
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const gutterRef = useRef(null);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const lines = useMemo(() => {
    return value.split('\n');
  }, [value]);

  const handleScroll = (e) => {
    const { scrollTop, scrollLeft } = e.target;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  const handleKeyDown = (e) => {
    // Tab key: insert 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);

      if (onChange) onChange(newValue);

      // Restore cursor position after state updates
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const updateCursorPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selStart = textarea.selectionStart;
    const textBefore = value.substring(0, selStart);
    const lineNum = textBefore.split('\n').length;
    const lastNewline = textBefore.lastIndexOf('\n');
    const colNum = lastNewline === -1 ? selStart + 1 : selStart - lastNewline;

    setCursorPos({ line: lineNum, col: colNum });
  };

  return (
    <div
      dir="ltr"
      className="flex flex-col h-full rounded-xl overflow-hidden border border-[#2b2b2b] bg-[#1e1e1e] shadow-2xl font-mono text-xs sm:text-[13px]"
    >
      {/* VS Code Tab Bar & Breadcrumb */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#333333] select-none text-xs">
        <div className="flex items-center gap-2">
          {/* Active File Tab */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-t-md bg-[#1e1e1e] text-[#cccccc] border-t-2 border-cyan-400 font-medium shadow-sm">
            <span className="text-cyan-400 font-bold">🐍</span>
            <span>{filename}</span>
          </div>

          {/* Breadcrumb */}
          <span className="hidden sm:inline-block text-[#858585] text-[11px] ml-2">
            pandapulse &gt; {filename}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#858585] text-[11px]">
          <span>Python 3.12</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Editor Body: Gutter + Overlay Code Area */}
      <div className="relative flex-1 flex overflow-hidden bg-[#1e1e1e]">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="select-none py-3.5 pr-3 text-right bg-[#1e1e1e] border-r border-[#333333]/80 text-[#858585] overflow-hidden shrink-0 font-mono text-xs sm:text-[13px] leading-[22px] w-11"
        >
          {lines.map((_, i) => (
            <div
              key={i}
              className={cursorPos.line === i + 1 ? 'text-[#c6c6c6] font-bold' : ''}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Synchronized Code Area */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Background Syntax Highlighted Layer */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 p-3.5 m-0 whitespace-pre overflow-hidden pointer-events-none font-mono text-xs sm:text-[13px] leading-[22px] bg-[#1e1e1e]"
          >
            <code>
              {lines.map((line, idx) => (
                <div key={idx} className="whitespace-pre">
                  {highlightLine(line)}
                </div>
              ))}
            </code>
          </pre>

          {/* Foreground Transparent Textarea (Handles user typing and cursor) */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              if (onChange) onChange(e.target.value);
              updateCursorPosition();
            }}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            onClick={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="absolute inset-0 w-full h-full p-3.5 m-0 bg-transparent text-transparent caret-cyan-400 font-mono text-xs sm:text-[13px] leading-[22px] resize-none focus:outline-none overflow-auto selection:bg-[#264f78] selection:text-transparent whitespace-pre"
          />
        </div>
      </div>

      {/* VS Code Bottom Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#007acc]/85 text-white text-[11px] select-none font-sans">
        <div className="flex items-center gap-3">
          <span className="font-medium">PandaPulse Editor</span>
          <span>•</span>
          <span>Ready</span>
        </div>

        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>Spaces: 4</span>
          <span>Python (WASM)</span>
        </div>
      </div>
    </div>
  );
};
