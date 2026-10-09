import React, { useMemo } from 'react';

/**
 * VS Code Dark Modern Syntax Tokens & Color Palette
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
  parameter: 'text-[#9cdcfe]',                   // ignore_index, axis
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

/**
 * Tokenizes a single line of Python code into styled syntax spans.
 */
function highlightPythonLine(line) {
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

    // 3. Strings: Triple quotes, single, double, f-strings, r-strings
    const stringPrefixMatch = line.slice(i).match(/^([frbFRB]{1,2})?(f|r|b|fr|rf)?("""|'''|"|')/);
    if (stringPrefixMatch) {
      const prefix = stringPrefixMatch[1] || '';
      const quote = stringPrefixMatch[3];
      const startIdx = i;
      i += prefix.length + quote.length;

      let escaped = false;
      let closed = false;

      while (i < len) {
        if (escaped) {
          escaped = false;
          i++;
        } else if (line[i] === '\\') {
          escaped = true;
          i++;
        } else if (line.slice(i, i + quote.length) === quote) {
          i += quote.length;
          closed = true;
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

    // 4. Numbers: 0, 100.5, 1e-9, etc.
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
          // Method or attribute
          style = VS_THEME.variable;
        } else if (word === word.toUpperCase() && word.length > 1) {
          // Constants in uppercase e.g. OOM, RAM
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

    // 7. Brackets, Punctuation, Whitespace
    tokens.push(
      <span key={`punct-${i}`} className="text-slate-300">
        {line[i]}
      </span>
    );
    i++;
  }

  return tokens;
}

/**
 * VS Code Dark Modern Code Block with Line Numbers & Syntax Highlighting
 */
export const PythonHighlighter = ({
  code = '',
  showLineNumbers = true,
  className = '',
  maxHeight = 'max-h-[520px]',
}) => {
  const lines = useMemo(() => {
    return code.split('\n');
  }, [code]);

  return (
    <div
      dir="ltr"
      className={`relative w-full font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto text-left selection:bg-[#6799fe]/30 selection:text-white ${className}`}
    >
      <div className={`p-4 ${maxHeight} overflow-y-auto no-scrollbar`}>
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                {/* Line Number Gutter (Non-selectable) */}
                {showLineNumbers && (
                  <td
                    className="select-none pr-4 text-right align-top text-white/30 font-mono text-[11px] w-9 border-r border-white/[0.06] whitespace-nowrap"
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </td>
                )}

                {/* Code Content */}
                <td className={`${showLineNumbers ? 'pl-4' : ''} whitespace-pre align-top`}>
                  {highlightPythonLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
