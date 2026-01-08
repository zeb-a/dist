import React from 'react';
import { fallbackInitialsDataUrl } from '../utils/avatar';

export default function SafeAvatar({ src, name, alt, style, ...rest }) {
  const [avatar, setAvatar] = React.useState(() => src || fallbackInitialsDataUrl(name));

  React.useEffect(() => {
    let mounted = true;
    if (!src) {
      setAvatar(fallbackInitialsDataUrl(name));
      return;
    }
    // If src is a data URL, set directly (no network request).
    if (typeof src === 'string' && src.startsWith('data:')) {
      setAvatar(src);
      return;
    }

    // Try fetching the avatar first to avoid letting the <img> tag directly hit a 400 from DiceBear
    fetch(src, { method: 'GET', mode: 'cors' })
      .then(res => {
        if (!mounted) return;
        if (res.ok) setAvatar(src);
        else setAvatar(fallbackInitialsDataUrl(name));
      })
      .catch(() => {
        if (!mounted) return;
        setAvatar(fallbackInitialsDataUrl(name));
      });

    return () => { mounted = false; };
  }, [src, name]);

  return (
    <img src={avatar} alt={alt || name} style={style} {...rest} />
  );
}
