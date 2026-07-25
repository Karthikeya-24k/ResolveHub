function fileIcon(type) {
  if (!type) return 'attach_file';
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf') return 'picture_as_pdf';
  return 'description';
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const AttachmentList = ({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Attachments
      </p>
      <ul className="space-y-1.5">
        {attachments.map((a) => (
          <li key={a.id}>
            {a.fileType?.startsWith('image/') ? (
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={a.url}
                  alt={a.originalName}
                  className="max-h-48 rounded-lg object-cover border"
                  style={{ borderColor: 'var(--surface-border)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{a.originalName}</p>
              </a>
            ) : (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)' }}
              >
                <span className="material-symbols-outlined text-indigo-400 text-[20px] shrink-0">
                  {fileIcon(a.fileType)}
                </span>
                <span className="flex-1 truncate font-medium">{a.originalName}</span>
                {a.fileSize && (
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {formatSize(a.fileSize)}
                  </span>
                )}
                <span className="material-symbols-outlined text-[16px] shrink-0 text-indigo-400">download</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttachmentList;
