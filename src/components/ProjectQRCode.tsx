import React from 'react';

type Props = {
  label?: string;
  value: string;
};

export function ProjectQRCode({ label = 'Scan project link', value }: Props) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&format=svg&data=${encodeURIComponent(value)}`;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center">
      <h3 className="font-semibold text-slate-100">{label}</h3>
      <img
        src={src}
        width={220}
        height={220}
        loading="lazy"
        alt={`QR code for ${label}`}
        className="mx-auto my-4 rounded-lg bg-white p-2"
      />
      <p className="break-all font-mono text-xs text-slate-400">{value}</p>
      <p className="mt-2 text-xs text-amber-300">
        QR encodes this public project URL; it does not prove blockchain deployment.
      </p>
    </section>
  );
}
