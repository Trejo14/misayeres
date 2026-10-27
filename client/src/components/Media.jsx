// Muestra un archivo subido como imagen o como video segun su tipo.
// `video` recibe atributos extra solo para el caso de video (controls, autoPlay...).
export default function Media({ src, tipo, alt = '', video = {}, ...props }) {
  if (tipo === 'video') {
    return <video src={src} muted playsInline preload="metadata" {...video} {...props} />;
  }
  return <img src={src} alt={alt} loading="lazy" {...props} />;
}
