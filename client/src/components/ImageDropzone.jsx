import { useRef, useState } from 'react';
import axios from 'axios';
import { ImagePlus, Trash2, RefreshCw } from 'lucide-react';

// Limite del servidor por imagen ya procesada.
const MAX_SIZE = 5 * 1024 * 1024;
// Limite del archivo original: las fotos grandes se reducen antes de subirlas.
const MAX_ORIGINAL = 40 * 1024 * 1024;
const MAX_LADO = 1600;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const cargarImagen = async (file) => {
  try {
    // Respeta la orientacion EXIF de las fotos tomadas con celular.
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
};

// Reduce la foto a un maximo de 1600 px por lado y la convierte a JPG.
// Los GIF se dejan igual para no perder la animacion.
const comprimir = async (file) => {
  if (file.type === 'image/gif') return file;

  const img = await cargarImagen(file);
  const escala = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  const ctx = canvas.getContext('2d');
  // Fondo blanco para los PNG con transparencia.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.close?.();

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new Error('No se pudo procesar la imagen');
  // Si la original ya era mas ligera, se conserva.
  if (escala === 1 && blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
};

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
    if (file.size > MAX_ORIGINAL) {
      setError('La imagen no puede pesar mas de 40 MB.');
      return;
    }

    setUploading(true);
    try {
      let listo;
      try {
        listo = await comprimir(file);
      } catch {
        setError('No se pudo procesar la imagen. Prueba con otro archivo.');
        return;
      }
      if (listo.size > MAX_SIZE) {
        setError(file.type === 'image/gif'
          ? 'Los GIF no pueden pesar mas de 5 MB.'
          : 'La imagen sigue pesando mas de 5 MB despues de reducirla.');
        return;
      }

      const data = new FormData();
      data.append('imagen', listo);
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
            <p style={{ fontSize: '13px' }}>o haz clic para elegir un archivo &middot; JPG, PNG, WEBP o GIF hasta 40 MB</p>
          </>
        )}
        {(uploading || (dragging && value)) && (
          <div className="dropzone-overlay">
            {uploading ? 'Procesando y subiendo imagen...' : 'Suelta para reemplazar'}
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
