import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  Terminal,
  Copy,
  Check,
  FileCode,
  Sparkles,
  Play,
  Command,
  HelpCircle,
  Code,
  X,
  Keyboard,
} from 'lucide-react';

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
 * Built-in Python & Pandas Snippets Catalog
 */
const PYTHON_SNIPPETS = [
  {
    prefix: 'def',
    label: 'def function_name(args):',
    detail: 'Define a function with docstring',
    kind: 'snippet',
    insert: (indent) => `def my_function(arg1):\n${indent}    """Docstring description."""\n${indent}    pass`
  },
  {
    prefix: 'class',
    label: 'class ClassName:',
    detail: 'Define a class with __init__',
    kind: 'snippet',
    insert: (indent) => `class MyClass:\n${indent}    def __init__(self):\n${indent}        pass`
  },
  {
    prefix: 'main',
    label: "if __name__ == '__main__':",
    detail: 'Main execution block guard',
    kind: 'snippet',
    insert: (indent) => `if __name__ == '__main__':\n${indent}    pass`
  },
  {
    prefix: 'ifmain',
    label: "if __name__ == '__main__':",
    detail: 'Main execution block guard',
    kind: 'snippet',
    insert: (indent) => `if __name__ == '__main__':\n${indent}    pass`
  },
  {
    prefix: 'for',
    label: 'for item in items:',
    detail: 'Standard for loop',
    kind: 'snippet',
    insert: (indent) => `for item in items:\n${indent}    pass`
  },
  {
    prefix: 'fori',
    label: 'for i, item in enumerate(items):',
    detail: 'Indexed for loop with enumerate',
    kind: 'snippet',
    insert: (indent) => `for i, item in enumerate(items):\n${indent}    pass`
  },
  {
    prefix: 'while',
    label: 'while condition:',
    detail: 'While loop block',
    kind: 'snippet',
    insert: (indent) => `while condition:\n${indent}    pass`
  },
  {
    prefix: 'try',
    label: 'try ... except Exception as e:',
    detail: 'Exception handling block',
    kind: 'snippet',
    insert: (indent) => `try:\n${indent}    pass\n${indent}except Exception as e:\n${indent}    print(f"Error: {e}")`
  },
  {
    prefix: 'with',
    label: "with open('filename', 'r') as f:",
    detail: 'Context manager safe resource block',
    kind: 'snippet',
    insert: (indent) => `with open('data.txt', 'r') as f:\n${indent}    content = f.read()`
  },
  {
    prefix: 'pd',
    label: 'import pandas as pd',
    detail: 'Import Pandas module',
    kind: 'module',
    insert: () => `import pandas as pd`
  },
  {
    prefix: 'np',
    label: 'import numpy as np',
    detail: 'Import NumPy module',
    kind: 'module',
    insert: () => `import numpy as np`
  },
  {
    prefix: 'plt',
    label: 'import matplotlib.pyplot as plt',
    detail: 'Import Matplotlib Pyplot',
    kind: 'module',
    insert: () => `import matplotlib.pyplot as plt`
  },
  {
    prefix: 'df',
    label: 'df = pd.DataFrame({...})',
    detail: 'Sample Pandas DataFrame with Arrow types',
    kind: 'snippet',
    insert: (indent) => `df = pd.DataFrame({\n${indent}    'id': ['A01', 'A02', 'B01'],\n${indent}    'value': [10.5, 25.0, 42.8],\n${indent}    'status': ['OK', 'PENDING', 'OK']\n${indent}})`
  },
  {
    prefix: 'concat',
    label: 'pd.concat([df1, df2], ignore_index=True)',
    detail: 'Modern Pandas 2.0 concat',
    kind: 'function',
    insert: () => `combined_df = pd.concat([df1, df2], ignore_index=True)`
  },
  {
    prefix: 'merge',
    label: 'pd.merge(df1, df2, on="key")',
    detail: 'Merge two DataFrames on key',
    kind: 'function',
    insert: () => `merged_df = pd.merge(df1, df2, on='key', how='inner')`
  },
  {
    prefix: 'groupby',
    label: 'df.groupby("category").agg(...)',
    detail: 'Group by aggregation',
    kind: 'function',
    insert: () => `df.groupby('category').agg({'sales': ['count', 'sum', 'mean']})`
  },
  {
    prefix: 'read_csv',
    label: "pd.read_csv('data.csv', engine='pyarrow')",
    detail: 'Read CSV with PyArrow engine',
    kind: 'function',
    insert: () => `df = pd.read_csv('data.csv', engine='pyarrow')`
  },
  {
    prefix: 'print',
    label: 'print(...)',
    detail: 'Print object to console',
    kind: 'function',
    insert: () => `print()`
  },
  {
    prefix: 'lambda',
    label: 'lambda x: ...',
    detail: 'Anonymous lambda expression',
    kind: 'snippet',
    insert: () => `lambda x: x`
  },
  {
    prefix: 'listcomp',
    label: '[x for x in items if ...]',
    detail: 'List comprehension',
    kind: 'snippet',
    insert: () => `[x for x in items if condition]`
  },
];

// Bracket & Quote auto-closing pairs map
const PAIR_MAP = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '`': '`',
};

const CLOSING_SET = new Set([')', ']', '}', '"', "'", '`']);

/**
 * Interactive VS Code Code Editor with live syntax highlighting,
 * auto-closing pairs, intelligent auto-indentation, Python snippets,
 * and standard VS Code keyboard shortcuts.
 */
export const VSCodeEditor = ({
  value = '',
  onChange,
  filename = 'pipeline.py',
  onRun,
}) => {
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const gutterRef = useRef(null);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(0);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showSnippetsMenu, setShowSnippetsMenu] = useState(false);

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

  const updateCursorPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selStart = textarea.selectionStart;
    const textBefore = value.substring(0, selStart);
    const lineNum = textBefore.split('\n').length;
    const lastNewline = textBefore.lastIndexOf('\n');
    const colNum = lastNewline === -1 ? selStart + 1 : selStart - lastNewline;

    setCursorPos({ line: lineNum, col: colNum });

    // Inspect word before cursor for live IntelliSense suggestions
    const match = textBefore.match(/([a-zA-Z_]\w*)$/);
    if (match) {
      const word = match[1].toLowerCase();
      if (word.length >= 2) {
        const filtered = PYTHON_SNIPPETS.filter(
          (s) => s.prefix.toLowerCase().startsWith(word) || s.label.toLowerCase().includes(word)
        ).slice(0, 6);
        setSuggestions(filtered);
        setActiveSuggestionIdx(0);
        return;
      }
    }
    setSuggestions([]);
  };

  const applySnippet = (snippet) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(start);

    // Match typed prefix
    const match = textBefore.match(/([a-zA-Z_]\w*)$/);
    const prefixLength = match ? match[1].length : 0;
    const replaceStart = start - prefixLength;

    // Detect indentation of current line
    const linesBefore = textBefore.split('\n');
    const currentLine = linesBefore[linesBefore.length - 1];
    const indentMatch = currentLine.match(/^(\s*)/);
    const currentIndent = indentMatch ? indentMatch[1] : '';

    const snippetCode = typeof snippet.insert === 'function' ? snippet.insert(currentIndent) : snippet.label;
    const newValue = value.substring(0, replaceStart) + snippetCode + textAfter;

    if (onChange) onChange(newValue);
    setSuggestions([]);
    setShowSnippetsMenu(false);

    setTimeout(() => {
      let targetCursor = replaceStart + snippetCode.length;
      if (snippetCode.includes('print()')) {
        targetCursor = replaceStart + snippetCode.indexOf('()') + 1;
      } else if (snippetCode.includes('pass')) {
        const passIdx = snippetCode.indexOf('pass');
        targetCursor = replaceStart + passIdx;
        textarea.selectionStart = targetCursor;
        textarea.selectionEnd = targetCursor + 4;
        updateCursorPosition();
        textarea.focus();
        return;
      }
      textarea.selectionStart = textarea.selectionEnd = targetCursor;
      updateCursorPosition();
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 1. If IntelliSense suggestions popup is open
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIdx((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIdx((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        applySnippet(suggestions[activeSuggestionIdx]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSuggestions([]);
        return;
      }
    }

    // 2. Ctrl + Enter: Run Python WASM Code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onRun) onRun();
      return;
    }

    // 3. Ctrl + Space: Trigger Autocomplete
    if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
      e.preventDefault();
      const textBefore = value.substring(0, start);
      const match = textBefore.match(/([a-zA-Z_]\w*)$/);
      const word = match ? match[1].toLowerCase() : '';
      const filtered = word
        ? PYTHON_SNIPPETS.filter((s) => s.prefix.toLowerCase().startsWith(word) || s.label.toLowerCase().includes(word))
        : PYTHON_SNIPPETS;
      setSuggestions(filtered.slice(0, 7));
      setActiveSuggestionIdx(0);
      return;
    }

    // 4. Ctrl + /: Toggle Comment
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const allLines = value.split('\n');
      const startLineIdx = value.substring(0, start).split('\n').length - 1;
      const endLineIdx = value.substring(0, end).split('\n').length - 1;

      const targetLines = allLines.slice(startLineIdx, endLineIdx + 1);
      const allCommented = targetLines.every((line) => line.trim().startsWith('#') || line.trim() === '');

      const updated = targetLines.map((line) => {
        if (allCommented) {
          return line.replace(/^(\s*)#\s?/, '$1');
        } else {
          if (line.trim() === '') return line;
          return line.replace(/^(\s*)/, '$1# ');
        }
      });

      allLines.splice(startLineIdx, targetLines.length, ...updated);
      const newVal = allLines.join('\n');
      if (onChange) onChange(newVal);
      setTimeout(() => {
        textarea.selectionStart = start;
        textarea.selectionEnd = end + (newVal.length - value.length);
        updateCursorPosition();
      }, 0);
      return;
    }

    // 5. Ctrl + D: Duplicate Current Line
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      const allLines = value.split('\n');
      const lineIdx = value.substring(0, start).split('\n').length - 1;
      const currentLine = allLines[lineIdx];
      allLines.splice(lineIdx + 1, 0, currentLine);
      const newVal = allLines.join('\n');
      if (onChange) onChange(newVal);
      setTimeout(() => {
        const newPos = start + currentLine.length + 1;
        textarea.selectionStart = textarea.selectionEnd = newPos;
        updateCursorPosition();
      }, 0);
      return;
    }

    // 6. Alt + ArrowUp / ArrowDown: Move Line
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const allLines = value.split('\n');
      const lineIdx = value.substring(0, start).split('\n').length - 1;

      if (e.key === 'ArrowUp' && lineIdx > 0) {
        const temp = allLines[lineIdx];
        allLines[lineIdx] = allLines[lineIdx - 1];
        allLines[lineIdx - 1] = temp;
        const newVal = allLines.join('\n');
        if (onChange) onChange(newVal);
        setTimeout(() => {
          const offsetInLine = start - allLines.slice(0, lineIdx).join('\n').length;
          const targetPos = Math.max(0, allLines.slice(0, lineIdx - 1).join('\n').length + offsetInLine);
          textarea.selectionStart = textarea.selectionEnd = targetPos;
          updateCursorPosition();
        }, 0);
      } else if (e.key === 'ArrowDown' && lineIdx < allLines.length - 1) {
        const temp = allLines[lineIdx];
        allLines[lineIdx] = allLines[lineIdx + 1];
        allLines[lineIdx + 1] = temp;
        const newVal = allLines.join('\n');
        if (onChange) onChange(newVal);
        setTimeout(() => {
          const offsetInLine = start - allLines.slice(0, lineIdx).join('\n').length;
          const targetPos = allLines.slice(0, lineIdx + 1).join('\n').length + offsetInLine;
          textarea.selectionStart = textarea.selectionEnd = targetPos;
          updateCursorPosition();
        }, 0);
      }
      return;
    }

    // 7. Tab & Shift + Tab
    if (e.key === 'Tab') {
      e.preventDefault();

      // Check if user is typing a snippet prefix like 'def', 'pd', 'df', 'main'
      const textBefore = value.substring(0, start);
      const match = textBefore.match(/([a-zA-Z_]\w*)$/);
      if (!e.shiftKey && match) {
        const word = match[1].toLowerCase();
        const exactSnippet = PYTHON_SNIPPETS.find((s) => s.prefix.toLowerCase() === word);
        if (exactSnippet) {
          applySnippet(exactSnippet);
          return;
        }
      }

      if (e.shiftKey) {
        // Outdent (remove 4 spaces from current line)
        const allLines = value.split('\n');
        const startLineIdx = value.substring(0, start).split('\n').length - 1;
        const endLineIdx = value.substring(0, end).split('\n').length - 1;
        const targetLines = allLines.slice(startLineIdx, endLineIdx + 1);

        const updated = targetLines.map((line) => line.replace(/^ {1,4}/, ''));
        allLines.splice(startLineIdx, targetLines.length, ...updated);
        const newVal = allLines.join('\n');
        if (onChange) onChange(newVal);
        setTimeout(() => {
          textarea.selectionStart = Math.max(0, start - 4);
          textarea.selectionEnd = Math.max(0, end - (value.length - newVal.length));
          updateCursorPosition();
        }, 0);
        return;
      }

      // Standard Indent 4 spaces
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      if (onChange) onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
        updateCursorPosition();
      }, 0);
      return;
    }

    // 8. Auto-Closing Pairs: (, [, {, ", ', `
    if (PAIR_MAP[e.key]) {
      const closeChar = PAIR_MAP[e.key];

      // Wrap active selection
      if (start !== end) {
        e.preventDefault();
        const selectedText = value.substring(start, end);
        const newValue = value.substring(0, start) + e.key + selectedText + closeChar + value.substring(end);
        if (onChange) onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = end + 1;
          updateCursorPosition();
        }, 0);
        return;
      }

      // If typing closing character that is already immediately next, skip over it
      if (CLOSING_SET.has(e.key) && value[start] === e.key) {
        e.preventDefault();
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
          updateCursorPosition();
        }, 0);
        return;
      }

      // Auto-insert pair and place cursor between them
      e.preventDefault();
      const newValue = value.substring(0, start) + e.key + closeChar + value.substring(end);
      if (onChange) onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        updateCursorPosition();
      }, 0);
      return;
    }

    // 9. Overtyping closing characters when no selection: ), ], }, ", ', `
    if (CLOSING_SET.has(e.key) && start === end && value[start] === e.key) {
      e.preventDefault();
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        updateCursorPosition();
      }, 0);
      return;
    }

    // 10. Smart Backspace: Delete pair together
    if (e.key === 'Backspace' && start === end && start > 0 && start < value.length) {
      const prevChar = value[start - 1];
      const nextChar = value[start];
      if (PAIR_MAP[prevChar] === nextChar) {
        e.preventDefault();
        const newValue = value.substring(0, start - 1) + value.substring(start + 1);
        if (onChange) onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1;
          updateCursorPosition();
        }, 0);
        return;
      }
    }

    // 11. Smart Enter: Auto-indent after ':', bracket expansion
    if (e.key === 'Enter') {
      const textBefore = value.substring(0, start);
      const textAfter = value.substring(start);
      const linesBefore = textBefore.split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];

      const indentMatch = currentLine.match(/^(\s*)/);
      let indent = indentMatch ? indentMatch[1] : '';

      const prevChar = textBefore.slice(-1);
      const nextChar = textAfter.slice(0, 1);
      const isBracketPair =
        (prevChar === '{' && nextChar === '}') ||
        (prevChar === '(' && nextChar === ')') ||
        (prevChar === '[' && nextChar === ']');

      if (isBracketPair) {
        e.preventDefault();
        const innerIndent = indent + '    ';
        const insertText = '\n' + innerIndent + '\n' + indent;
        const newValue = textBefore + insertText + textAfter;
        if (onChange) onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + innerIndent.length;
          updateCursorPosition();
        }, 0);
        return;
      }

      if (currentLine.trimEnd().endsWith(':')) {
        e.preventDefault();
        indent += '    ';
        const insertText = '\n' + indent;
        const newValue = textBefore + insertText + textAfter;
        if (onChange) onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
          updateCursorPosition();
        }, 0);
        return;
      }

      if (indent.length > 0) {
        e.preventDefault();
        const insertText = '\n' + indent;
        const newValue = textBefore + insertText + textAfter;
        if (onChange) onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
          updateCursorPosition();
        }, 0);
        return;
      }
    }
  };

  return (
    <div
      dir="ltr"
      className="relative flex flex-col h-full rounded-xl overflow-hidden border border-[#2b2b2b] bg-[#1e1e1e] shadow-2xl font-mono text-xs sm:text-[13px]"
    >
      {/* VS Code Tab Bar & Toolbar */}
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

        {/* Toolbar Quick Actions */}
        <div className="flex items-center gap-2 text-[#858585] text-[11px]">
          {/* Snippets Quick Menu Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSnippetsMenu(!showSnippetsMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2d2d2d] hover:bg-[#383838] text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Insert Python Snippet"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Snippets</span>
            </button>

            {/* Snippets Dropdown */}
            {showSnippetsMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 max-h-60 overflow-y-auto no-scrollbar rounded-lg bg-[#252526] border border-[#454545] shadow-2xl z-40 p-1">
                <div className="px-2 py-1 text-[10px] text-white/50 border-b border-[#333] font-sans">
                  Click to insert Python snippet
                </div>
                {PYTHON_SNIPPETS.map((snippet, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySnippet(snippet)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#04395e] text-white/90 hover:text-white flex items-center justify-between group transition-colors"
                  >
                    <span className="font-mono text-xs">{snippet.prefix}</span>
                    <span className="text-[10px] text-white/40 group-hover:text-white/70 truncate ml-2">
                      {snippet.detail}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Shortcuts Info Trigger */}
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#2d2d2d] hover:bg-[#383838] text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Keyboard Shortcuts Cheat-sheet"
          >
            <Keyboard className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>

          {/* Run Code Button */}
          {onRun && (
            <button
              type="button"
              onClick={onRun}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
              title="Run Python Script (Ctrl + Enter)"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run</span>
            </button>
          )}

          <span className="hidden md:inline text-[#858585]">Python 3.12</span>
          <span className="hidden md:inline text-[#858585]">UTF-8</span>
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

          {/* Foreground Transparent Textarea (Handles typing, cursor, and shortcuts) */}
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

          {/* Floating VS Code IntelliSense Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div
              style={{
                top: Math.min(
                  Math.max(10, (cursorPos.line - 1) * 22 + 36 - (textareaRef.current?.scrollTop || 0)),
                  (textareaRef.current?.clientHeight || 400) - 200
                ),
                left: Math.min(
                  Math.max(20, 20 + (cursorPos.col - 1) * 7.8 - (textareaRef.current?.scrollLeft || 0)),
                  (textareaRef.current?.clientWidth || 500) - 260
                ),
              }}
              className="absolute z-30 w-64 max-h-52 overflow-y-auto no-scrollbar rounded-md bg-[#252526] border border-[#454545] shadow-2xl text-xs font-mono select-none"
            >
              <div className="px-2 py-1 text-[10px] text-[#858585] border-b border-[#333333] flex items-center justify-between bg-[#1e1e1e]">
                <span>IntelliSense Suggestions</span>
                <span className="text-[9px]">Tab / ↵ to insert</span>
              </div>
              <div className="py-0.5">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applySnippet(item);
                    }}
                    className={`px-2.5 py-1 flex items-center justify-between cursor-pointer transition-colors ${
                      idx === activeSuggestionIdx
                        ? 'bg-[#04395e] text-white font-semibold'
                        : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`text-[11px] ${
                        item.kind === 'snippet'
                          ? 'text-amber-400'
                          : item.kind === 'module'
                          ? 'text-[#4ec9b0]'
                          : 'text-[#dcdcaa]'
                      }`}>
                        {item.kind === 'snippet' ? '⧉' : item.kind === 'module' ? '✦' : 'λ'}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="text-[9px] text-[#858585] capitalize shrink-0 ml-1">
                      {item.kind}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VS Code Bottom Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1 bg-[#007acc]/90 text-white text-[11px] select-none font-sans gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PandaPulse Editor</span>
          </span>
          <span>•</span>
          <span className="text-white/80 hidden sm:inline">Ctrl+Enter Run · Ctrl+/ Comment · Tab Snippet</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>Spaces: 4</span>
          <span>Python (WASM)</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Cheat-sheet Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#1e1e1e] border border-[#333333] shadow-2xl p-5 text-white font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">VS Code Shortcuts & Snippets</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <span className="text-white/80">تشغيل الكود (Run Script)</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-cyan-300">Ctrl + Enter</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <span className="text-white/80">تعليق / فك التعليق (Toggle Comment)</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-cyan-300">Ctrl + /</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <span className="text-white/80">إكمال القصاصات والمحاذاة (Snippets & Indent)</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-cyan-300">Tab</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <span className="text-white/80">قائمة الاقتراحات الذكية (IntelliSense)</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-cyan-300">Ctrl + Space</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <span className="text-white/80">تكرار السطر الحالي (Duplicate Line)</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-cyan-300">Ctrl + D</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <span className="text-white/80">تحريك السطر للأعلى / للأسفل</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-cyan-300">Alt + ↑ / ↓</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <span className="text-white/80">الإغلاق التلقائي للأقواس والاقتباس</span>
                <span className="text-emerald-400 font-mono text-xs">(), [], {}, "", '', ``</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 rounded-full bg-white text-[#0a0a0a] text-xs font-semibold hover:bg-white/90 transition-colors cursor-pointer"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

