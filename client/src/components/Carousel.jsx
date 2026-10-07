import { useRef, useState, useEffect, Children } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Carrusel horizontal: se desliza con el dedo, la rueda o las flechas laterales.
// Las flechas solo aparecen cuando hay mas contenido hacia ese lado.
export default function Carousel({ children, label }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const count = Children.count(children);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [count]);

  const move = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <div className="carousel" role="region" aria-label={label}>
      {canPrev && (
        <button type="button" className="carousel-arrow carousel-arrow-prev" onClick={() => move(-1)} aria-label="Anterior">
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>
      )}
      <div className="carousel-track" ref={trackRef} onScroll={updateArrows}>
        {Children.map(children, child => (
          <div className="carousel-slide">{child}</div>
        ))}
      </div>
      {canNext && (
        <button type="button" className="carousel-arrow carousel-arrow-next" onClick={() => move(1)} aria-label="Siguiente">
          <ChevronRight size={20} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
