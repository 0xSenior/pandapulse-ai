/**
 * Pyodide WebAssembly Python Execution Engine for PandaPulse AI.
 *
 * Runs Python 3.12, Pandas 2.x, NumPy, and Matplotlib 100% client-side in the browser.
 * Features:
 * - Lazy-loaded WebAssembly runtime from official CDN.
 * - Stdout / Stderr streaming capture.
 * - Automatic DataFrame detection & serialization to structured table JSON.
 * - Automatic Matplotlib figure rendering to Base64 PNG.
 * - Virtual File System (VFS) mounting for user-uploaded CSV/Excel datasets.
 */

let pyodideInstance = null;
let pyodideLoadingPromise = null;
const loadedPackages = new Set();

/**
 * Dynamically loads the Pyodide WebAssembly script tag if not present.
 */
function loadPyodideScript() {
  return new Promise((resolve, reject) => {
    if (window.loadPyodide) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[data-pyodide]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
    script.setAttribute('data-pyodide', 'true');
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(new Error('Failed to load Pyodide WebAssembly from CDN: ' + err));
    document.head.appendChild(script);
  });
}

/**
 * Initializes or returns the cached Pyodide WebAssembly instance.
 */
export async function getPyodide(onProgress) {
  if (pyodideInstance) return pyodideInstance;

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = (async () => {
    if (onProgress) onProgress({ stage: 'script', message: 'Loading WebAssembly runtime...' });
    await loadPyodideScript();

    if (onProgress) onProgress({ stage: 'init', message: 'Booting Python 3.12 WASM engine...' });
    const pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });

    // Ensure virtual directories exist
    try {
      pyodide.FS.mkdir('/data');
    } catch {
      // directory may already exist
    }

    pyodideInstance = pyodide;
    return pyodide;
  })();

  return pyodideLoadingPromise;
}

/**
 * Loads required packages (pandas, numpy, matplotlib) into the runtime.
 */
export async function ensurePackages(packages = ['pandas', 'numpy', 'matplotlib'], onProgress) {
  const pyodide = await getPyodide(onProgress);
  const needed = packages.filter((pkg) => !loadedPackages.has(pkg));

  if (needed.length > 0) {
    if (onProgress) onProgress({ stage: 'packages', message: `Loading ${needed.join(', ')}...` });
    await pyodide.loadPackage(needed);
    needed.forEach((pkg) => loadedPackages.add(pkg));
  }
}

/**
 * Mounts a File or Uint8Array to the Pyodide Virtual File System (/data/fileName and ./fileName).
 */
export async function mountDataset(file, onProgress) {
  const pyodide = await getPyodide(onProgress);
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Write to both /data/filename and ./filename so relative paths work seamlessly
  const cleanName = file.name.replace(/\s+/g, '_');
  try {
    pyodide.FS.writeFile(`/data/${cleanName}`, bytes);
    pyodide.FS.writeFile(cleanName, bytes);
  } catch (err) {
    console.error('Failed to write file to Pyodide FS:', err);
    throw err;
  }

  return {
    name: cleanName,
    path: `/data/${cleanName}`,
    size: file.size,
    type: file.type || 'text/csv',
  };
}

/**
 * Python execution wrapper script that safely intercepts output,
 * DataFrames, and Matplotlib figures.
 */
const PYTHON_HARNESS = `
import sys
import io
import json
import base64

__pandapulse_stdout = io.StringIO()
__pandapulse_stderr = io.StringIO()
__pandapulse_saved_stdout = sys.stdout
__pandapulse_saved_stderr = sys.stderr
sys.stdout = __pandapulse_stdout
sys.stderr = __pandapulse_stderr

__pandapulse_dataframe = None
__pandapulse_plot_b64 = None
__pandapulse_error = None

try:
    # Execute user code in global namespace
    __pandapulse_exec_globals = globals()
    exec(__pandapulse_user_code, __pandapulse_exec_globals)

    # Check for Matplotlib figures
    if "matplotlib.pyplot" in sys.modules or "plt" in __pandapulse_exec_globals:
        import matplotlib.pyplot as plt
        if plt.get_fignums():
            buf = io.BytesIO()
            plt.savefig(buf, format="png", bbox_inches="tight", dpi=120, transparent=False, facecolor="#090d16")
            plt.close('all')
            buf.seek(0)
            __pandapulse_plot_b64 = base64.b64encode(buf.read()).decode("ascii")

    # Search for any recently created or modified pandas DataFrame
    if "pandas" in sys.modules:
        import pandas as pd
        for var_name, val in list(__pandapulse_exec_globals.items()):
            if isinstance(val, pd.DataFrame) and not var_name.startswith("_"):
                # Serialize DataFrame snapshot
                col_types = {col: str(dtype) for col, dtype in val.dtypes.items()}
                head_records = val.head(50).to_dict(orient="records")
                # Handle non-serializable objects (Timestamp, NaT, NaN)
                serialized_records = json.loads(pd.Series(head_records).to_json(orient="values", default_handler=str))
                __pandapulse_dataframe = {
                    "var_name": var_name,
                    "shape": [int(val.shape[0]), int(val.shape[1])],
                    "columns": list(val.columns),
                    "dtypes": col_types,
                    "records": serialized_records,
                    "memory_usage_kb": round(val.memory_usage(deep=True).sum() / 1024, 2)
                }
                break

except Exception as e:
    import traceback
    __pandapulse_error = {
        "type": type(e).__name__,
        "message": str(e),
        "traceback": traceback.format_exc()
    }

finally:
    sys.stdout = __pandapulse_saved_stdout
    sys.stderr = __pandapulse_saved_stderr

__pandapulse_result = {
    "stdout": __pandapulse_stdout.getvalue(),
    "stderr": __pandapulse_stderr.getvalue(),
    "dataframe": __pandapulse_dataframe,
    "plot": __pandapulse_plot_b64,
    "error": __pandapulse_error,
}
import json as __json
__json.dumps(__pandapulse_result)
`;

/**
 * Executes Python code inside Pyodide WebAssembly with live output capture.
 */
export async function executePythonCode(code, onProgress) {
  const startTime = performance.now();

  try {
    // 1. Detect if code uses pandas or matplotlib
    const packagesToLoad = [];
    if (/pandas|pd\./.test(code)) packagesToLoad.push('pandas');
    if (/numpy|np\./.test(code)) packagesToLoad.push('numpy');
    if (/matplotlib|plt\.|seaborn|sns\./.test(code)) {
      packagesToLoad.push('matplotlib');
      packagesToLoad.push('numpy');
    }

    if (packagesToLoad.length === 0) packagesToLoad.push('pandas'); // default for Pandas studio

    await ensurePackages(packagesToLoad, onProgress);
    const pyodide = await getPyodide();

    if (onProgress) onProgress({ stage: 'executing', message: 'Running Python code in WebAssembly...' });

    // Set user code variable in pyodide globals
    pyodide.globals.set('__pandapulse_user_code', code);

    // Run harness
    const jsonOutput = await pyodide.runPythonAsync(PYTHON_HARNESS);
    const result = JSON.parse(jsonOutput);
    const durationMs = Math.round(performance.now() - startTime);

    return {
      success: !result.error,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      dataframe: result.dataframe,
      plot: result.plot ? `data:image/png;base64,${result.plot}` : null,
      error: result.error,
      durationMs,
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      stdout: '',
      stderr: '',
      dataframe: null,
      plot: null,
      error: {
        type: 'RuntimeError',
        message: err.message || 'Execution error in WebAssembly runtime',
        traceback: err.stack || String(err),
      },
      durationMs,
    };
  }
}
