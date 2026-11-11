import React from 'react';

export default function Badge({ variant = 'pending', children, style = {} }) {
  const getBadgeClass = () => {
    const v = variant.toLowerCase();
    if (v === 'high') return 'badge badge-high';
    if (v === 'medium') return 'badge badge-medium';
    if (v === 'low') return 'badge badge-low';
    if (v === 'new' || v === 'active' || v === 'connected') return 'badge badge-new';
    return 'badge badge-pending';
  };

  return (
    <span className={getBadgeClass()} style={style}>
      {children}
    </span>
  );
}
