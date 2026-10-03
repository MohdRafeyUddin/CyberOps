import React from 'react';
import {
  Laptop,
  Smartphone,
  Tv,
  Cpu,
  Router as RouterIcon,
  Gamepad2,
  Printer,
  Tablet,
  HardDrive,
  Globe,
  Radio,
  Wifi,
} from 'lucide-react';

export default function DeviceTypeIcon({ type = 'Network Client', isGateway = false, className = 'w-4 h-4' }) {
  if (isGateway) {
    return <RouterIcon className={`${className} text-[#D4AF37]`} />;
  }

  const t = (type || '').toLowerCase();

  if (t.includes('tv')) {
    return <Tv className={`${className} text-sky-400`} />;
  }
  if (t.includes('phone') || t.includes('smartphone')) {
    return <Smartphone className={`${className} text-emerald-400`} />;
  }
  if (t.includes('laptop') || t.includes('pc') || t.includes('computer')) {
    return <Laptop className={`${className} text-blue-400`} />;
  }
  if (t.includes('tablet') || t.includes('ipad')) {
    return <Tablet className={`${className} text-indigo-400`} />;
  }
  if (t.includes('iot') || t.includes('smart') || t.includes('espressif') || t.includes('hue')) {
    return <Cpu className={`${className} text-amber-400`} />;
  }
  if (t.includes('game') || t.includes('playstation') || t.includes('xbox') || t.includes('nintendo') || t.includes('switch')) {
    return <Gamepad2 className={`${className} text-purple-400`} />;
  }
  if (t.includes('printer')) {
    return <Printer className={`${className} text-orange-400`} />;
  }
  if (t.includes('server') || t.includes('nas')) {
    return <HardDrive className={`${className} text-rose-400`} />;
  }

  return <Wifi className={`${className} text-slate-400`} />;
}
