import { useRef, useState } from 'react';

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx';

function fileIcon(type) {
  if (!type) return 'attach_file';
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf') return 'picture_as_pdf';
  return 'description';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const FileUpload = ({ files, onChange }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState([]);

  const validate = (incoming) => {
    const errs = [];
    const combined = [...files, ...incoming];
    if (combined.length > MAX_FILES)
      errs.push(`Maximum ${MAX_FILES} files allowed.`);
    incoming.forEach((f) => {
      if (f.size > MAX_SIZE_MB * 1024 * 1024)
        errs.push(`"${f.name}" exceeds ${MAX_SIZE_MB} MB.`);
      if (!ALLOWED_TYPES.includes(f.type))
        errs.push(`"${f.name}" is not an allowed file type.`);
    });
    return errs;
  };

  const addFiles = (incoming) => {
    const errs = validate(incoming);
    setErrors(errs);
    if (errs.length) return;
    onChange([...files, ...incoming]);
  };

  const handleInput = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const remove = (index) => {
    setErrors([]);
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-colors select-none
          ${dragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}
        style={{ backgroundColor: dragging ? undefined : 'var(--surface-raised)' }}
      >
        <span className="material-symbols-outlined text-3xl text-indigo-400">cloud_upload</span>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Drag & drop files here, or <span className="text-indigo-500">browse</span>
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Images, PDF, Word · Max {MAX_SIZE_MB} MB each · Up to {MAX_FILES} files
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS}
          className="hidden"
          onChange={handleInput}
        />
      </div>

      {/* Errors */}
      {errors.map((e, i) => (
        <p key={i} className="text-xs text-red-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>{e}
        </p>
      ))}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}
            >
              <span className="material-symbols-outlined text-indigo-400 text-[20px] shrink-0">
                {fileIcon(f.type)}
              </span>
              <span className="flex-1 truncate font-medium" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
              <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{formatSize(f.size)}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(i); }}
                className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUpload;
