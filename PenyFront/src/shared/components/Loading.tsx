import { useEffect, useState } from "react";
import styles from './../styles/Loading.module.css';

const messages = [
  "Cargando datos...",
  "Procesando información...",
  "Por favor espera...",
];

export function Loading() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const fadeOut = setTimeout(() => setFade(false), 1800);
    const next = setTimeout(() => {
      setIndex((i) => (i + 1) % messages.length);
      setFade(true);
    }, 2000);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(next);
    };
  }, [index]);

  return (
    <div className=" relative flex flex-col gap-4 items-center">
      <span className={styles.loader}></span>
      <span
        className={`!mt-4 text-gray-400 transition-opacity  duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
      >
        {messages[index]}
      </span>
    </div>
  );
}