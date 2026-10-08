/**
 * Export Utility for PandaPulse AI.
 * Exports code snippets and chat pipelines as .ipynb (Jupyter Notebook) or .py files.
 */

/**
 * Downloads a file to the client browser.
 */
function triggerDownload(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a production Python script (.py).
 */
export function exportAsPythonScript(code, filename = 'pandapulse_pipeline.py') {
  const header = `"""
PandaPulse AI Pipeline
Generated on: ${new Date().toISOString()}
Specialized for Python 3.x and Pandas 2.0+
"""

`;
  triggerDownload(header + code, filename, 'text/x-python');
}

/**
 * Generates and downloads a valid Jupyter Notebook (.ipynb).
 */
export function exportAsJupyterNotebook(cells = [], filename = 'pandapulse_notebook.ipynb') {
  // If cells is just a single code string, convert to notebook cell array
  let notebookCells = [];

  if (typeof cells === 'string') {
    notebookCells = [
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '# PandaPulse AI - Interactive Data Engineering Notebook\n',
          `*Generated on: ${new Date().toLocaleDateString()}*\n`,
          'Optimized for Python 3.x and modern Pandas 2.0+ pipelines.',
        ],
      },
      {
        cell_type: 'code',
        execution_count: 1,
        metadata: {},
        outputs: [],
        source: cells.split('\n').map((line, idx, arr) => (idx < arr.length - 1 ? line + '\n' : line)),
      },
    ];
  } else if (Array.isArray(cells)) {
    notebookCells = cells;
  }

  const notebook = {
    cells: notebookCells,
    metadata: {
      language_info: {
        name: 'python',
        version: '3.12.0',
      },
      kernelspec: {
        name: 'python3',
        display_name: 'Python 3 (ipykernel)',
      },
    },
    nbformat: 4,
    nbformat_minor: 5,
  };

  triggerDownload(JSON.stringify(notebook, null, 2), filename, 'application/x-ipynb+json');
}

/**
 * Downloads a base64 image as PNG.
 */
export function exportImageAsPNG(base64Data, filename = 'pandapulse_chart.png') {
  if (!base64Data) return;
  const link = document.createElement('a');
  link.href = base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports full chat conversation as a runnable Jupyter Notebook (.ipynb).
 */
export function exportChatAsJupyterNotebook(messages = [], filename = 'pandapulse_session.ipynb') {
  const cells = [
    {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '# PandaPulse AI - Session Notebook\n',
        `*Exported on: ${new Date().toLocaleString()}*\n`,
        'Specialized for Python 3.x and Modern Pandas 2.0+ Data Pipelines.\n',
      ],
    },
  ];

  let execCount = 1;
  messages.forEach((msg) => {
    if (msg.role === 'user') {
      cells.push({
        cell_type: 'markdown',
        metadata: {},
        source: [`### User Prompt\n`, `> ${msg.content.replace(/\n/g, '\n> ')}\n`],
      });
    } else if (msg.role === 'assistant') {
      const codeBlockRegex = /```(?:python|py)?\n([\s\S]*?)```/g;
      let lastIndex = 0;
      let match;

      while ((match = codeBlockRegex.exec(msg.content)) !== null) {
        const textBefore = msg.content.substring(lastIndex, match.index).trim();
        if (textBefore) {
          cells.push({
            cell_type: 'markdown',
            metadata: {},
            source: textBefore.split('\n').map((l, i, a) => (i < a.length - 1 ? l + '\n' : l)),
          });
        }
        const code = match[1].trim();
        if (code) {
          cells.push({
            cell_type: 'code',
            execution_count: execCount++,
            metadata: {},
            outputs: [],
            source: code.split('\n').map((l, i, a) => (i < a.length - 1 ? l + '\n' : l)),
          });
        }
        lastIndex = match.index + match[0].length;
      }

      const remainingText = msg.content.substring(lastIndex).trim();
      if (remainingText) {
        cells.push({
          cell_type: 'markdown',
          metadata: {},
          source: remainingText.split('\n').map((l, i, a) => (i < a.length - 1 ? l + '\n' : l)),
        });
      }
    }
  });

  exportAsJupyterNotebook(cells, filename);
}
