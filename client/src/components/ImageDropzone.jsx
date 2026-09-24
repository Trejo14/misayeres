import { useRef, useState } from 'react';
import axios from 'axios';
import { ImagePlus, Trash2, RefreshCw } from 'lucide-react';

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Campo de imagen: se puede arrastrar un archivo desde el explorador, hacer clic
// para elegirlo o pegarlo con Ctrl+V. Sube la imagen al servidor y entrega la URL.
export default function ImageDropzone({ value, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file) => {
    if (!file) return;
    setError('');

    if (!ACCEPTED.includes(file.type)) {
      setError('Formato no permitido. Usa JPG, PNG, WEBP o GIF.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('La imagen no puede pesar mas de 5 MB.');
      return;
    }

    const data = new FormData();
    data.append('imagen', file);
    setUploading(true);
    try {
      const res = await axios.post('/api/images', data);
      onChange(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    upload(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!dragging) setDragging(true);
  };

  const handleDragLeave = (e) => {
    // Ignorar cuando el cursor pasa sobre un hijo de la zona.
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  };

  const handlePaste = (e) => {
    const file = [...(e.clipboardData?.files || [])].find(f => f.type.startsWith('image/'));
    if (file) {
      e.preventDefault();
      upload(file);
    }
  };

  const openPicker = () => inputRef.current?.click();

  const classes = ['dropzone', dragging && 'dragging', value && 'has-image'].filter(Boolean).join(' ');

  return (
    <div>
      <div
        className={classes}
        role="button"
        tabIndex={0}
        onClick={value ? undefined : openPicker}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); } }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
        aria-label="Subir imagen del platillo"
      >
        {value ? (
          <>
            <img src={value} alt="Vista previa del platillo" />
            <div className="dropzone-actions">
              <button type="button" className="btn btn-sm btn-outline" onClick={openPicker} disabled={uploading}>
                <RefreshCw size={14} strokeWidth={1.5} /> Cambiar
              </button>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => onChange('')} disabled={uploading}>
                <Trash2 size={14} strokeWidth={1.5} /> Quitar
              </button>
            </div>
          </>
        ) : (
          <>
            <ImagePlus size={28} strokeWidth={1.25} style={{ marginBottom: '8px', opacity: 0.6 }} />
            <p><strong>Arrastra una imagen aqui</strong></p>
            <p style={{ fontSize: '13px' }}>o haz clic para elegir un archivo &middot; JPG, PNG, WEBP o GIF hasta 5 MB</p>
          </>
        )}
        {(uploading || (dragging && value)) && (
          <div className="dropzone-overlay">
            {uploading ? 'Subiendo imagen...' : 'Suelta para reemplazar'}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        style={{ display: 'none' }}
        onChange={e => { upload(e.target.files?.[0]); e.target.value = ''; }}
      />
      {error && <p className="form-hint" style={{ color: '#7a2e2e' }}>{error}</p>}
    </div>
  );
}
