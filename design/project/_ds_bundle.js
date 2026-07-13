/* @ds-bundle: {"format":4,"namespace":"SocialSuiteDesignSystem_f55d92","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"DonutChart","sourcePath":"components/data/DonutChart.jsx"},{"name":"HeatmapCell","sourcePath":"components/data/HeatmapCell.jsx"},{"name":"LineChart","sourcePath":"components/data/LineChart.jsx"},{"name":"PlatformIcon","sourcePath":"components/data/PlatformIcon.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"Table","sourcePath":"components/data/Table.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"},{"name":"WorkspaceSwitcher","sourcePath":"components/navigation/WorkspaceSwitcher.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"e112efc53fd5","components/core/Badge.jsx":"699f7e3794e1","components/core/Button.jsx":"1f51ed22b013","components/core/Card.jsx":"8b5cb2773acd","components/core/IconButton.jsx":"d0139dbf6968","components/core/Tag.jsx":"aae1d37baed5","components/data/DonutChart.jsx":"26e04dd4cdce","components/data/HeatmapCell.jsx":"52b076e8650d","components/data/LineChart.jsx":"474775ba1c44","components/data/PlatformIcon.jsx":"c84b5d9be57a","components/data/StatCard.jsx":"1f0eb51d4004","components/data/Table.jsx":"fe19bbca3df3","components/feedback/Dialog.jsx":"46094f5a1a18","components/feedback/EmptyState.jsx":"c20dc47d1031","components/feedback/ProgressBar.jsx":"5a4fc885c6f2","components/feedback/Toast.jsx":"76e2802fdfa2","components/feedback/Tooltip.jsx":"b44bc64c5f42","components/forms/Checkbox.jsx":"f99a6bb0f64c","components/forms/Input.jsx":"b46383de04ce","components/forms/Radio.jsx":"431eee9636d0","components/forms/Select.jsx":"63d5ecdbcfcc","components/forms/Switch.jsx":"03097eb8dd7b","components/forms/Textarea.jsx":"95691e990447","components/navigation/Sidebar.jsx":"ebd1778ccdd5","components/navigation/Tabs.jsx":"a8f5bf0a2057","components/navigation/TopBar.jsx":"0690b59f6162","components/navigation/WorkspaceSwitcher.jsx":"cad3aafb0125","ui_kits/socialsuite/App.jsx":"d88e9b6ff1da","ui_kits/socialsuite/mock-data.js":"de50c01d8fe7","ui_kits/socialsuite/screens/AdsScreen.jsx":"7d5b813fdc70","ui_kits/socialsuite/screens/AnalyticsScreen.jsx":"e51b66551134","ui_kits/socialsuite/screens/CalendarScreen.jsx":"18937dc4348c","ui_kits/socialsuite/screens/ComposerScreen.jsx":"82742601d359","ui_kits/socialsuite/screens/ConnectionsScreen.jsx":"282f203d88c6","ui_kits/socialsuite/screens/InboxScreen.jsx":"86186439dedb","ui_kits/socialsuite/screens/ReportingScreen.jsx":"1ed7566c7362","ui_kits/socialsuite/screens/SmartLinksScreen.jsx":"277434ba7a84","ui_kits/socialsuite/screens/TrackerScreen.jsx":"0c0796509903"},"inlinedExternals":[],"unexposedExports":[{"name":"adsCampaigns","sourcePath":"ui_kits/socialsuite/mock-data.js"},{"name":"connections","sourcePath":"ui_kits/socialsuite/mock-data.js"},{"name":"conversations","sourcePath":"ui_kits/socialsuite/mock-data.js"},{"name":"followersByCity","sourcePath":"ui_kits/socialsuite/mock-data.js"},{"name":"followersByCountry","sourcePath":"ui_kits/socialsuite/mock-data.js"},{"name":"growthSeries","sourcePath":"ui_kits/socialsuite/mock-data.js"},{"name":"platformPosts","sourcePath":"ui_kits/socialsuite/mock-data.js"},{"name":"scheduledPosts","sourcePath":"ui_kits/socialsuite/mock-data.js"},{"name":"smartLinkLinks","sourcePath":"ui_kits/socialsuite/mock-data.js"},{"name":"trackerSessions","sourcePath":"ui_kits/socialsuite/mock-data.js"},{"name":"workspaces","sourcePath":"ui_kits/socialsuite/mock-data.js"}]} */

(() => {

const __ds_ns = (window.SocialSuiteDesignSystem_f55d92 = window.SocialSuiteDesignSystem_f55d92 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
const sizes = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 56
};
function Avatar({
  initials,
  size = 'md',
  tone = 'blue'
}) {
  const dim = sizes[size] || sizes.md;
  const bg = tone === 'blue' ? 'var(--blue-100)' : 'var(--surface-sunken)';
  const fg = tone === 'blue' ? 'var(--accent-primary)' : 'var(--text-muted)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: dim,
      height: dim,
      borderRadius: '50%',
      background: bg,
      color: fg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: dim * 0.38,
      flexShrink: 0
    }
  }, initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const tones = {
  neutral: {
    bg: 'var(--surface-sunken)',
    fg: 'var(--text-muted)'
  },
  positive: {
    bg: 'var(--positive-bg)',
    fg: '#046FAF'
  },
  warning: {
    bg: 'var(--amber-bg)',
    fg: 'var(--amber)'
  },
  error: {
    bg: 'var(--red-bg)',
    fg: 'var(--red)'
  },
  brand: {
    bg: 'var(--blue-100)',
    fg: 'var(--accent-primary)'
  }
};
function Badge({
  children,
  tone = 'neutral',
  dot = false
}) {
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      background: t.bg,
      color: t.fg,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      lineHeight: 1.4
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: t.fg,
      flexShrink: 0
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const sizeStyles = {
  sm: {
    height: 32,
    padding: '0 12px',
    fontSize: 'var(--text-xs)',
    gap: 6
  },
  md: {
    height: 38,
    padding: '0 16px',
    fontSize: 'var(--text-sm)',
    gap: 8
  },
  lg: {
    height: 44,
    padding: '0 20px',
    fontSize: 'var(--text-md)',
    gap: 8
  }
};
const variantStyles = {
  primary: {
    background: 'var(--accent-primary)',
    color: '#fff',
    border: '1px solid transparent'
  },
  secondary: {
    background: 'var(--card)',
    color: 'var(--text)',
    border: '1px solid var(--border-strong)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid transparent'
  },
  danger: {
    background: 'var(--red)',
    color: '#fff',
    border: '1px solid transparent'
  }
};
const hoverBg = {
  primary: 'var(--accent-primary-hover)',
  secondary: 'var(--surface-sunken)',
  ghost: 'var(--surface-sunken)',
  danger: '#C81E1E'
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon = null,
  fullWidth = false,
  onClick,
  type = 'button'
}) {
  const [hover, setHover] = React.useState(false);
  const s = sizeStyles[size] || sizeStyles.md;
  const v = variantStyles[variant] || variantStyles.primary;
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: fullWidth ? '100%' : 'auto',
      height: s.height,
      padding: s.padding,
      gap: s.gap,
      fontFamily: 'var(--font-body)',
      fontSize: s.fontSize,
      fontWeight: 'var(--weight-medium)',
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
      ...v,
      background: !disabled && hover ? hoverBg[variant] : v.background
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  children,
  padding = 20,
  title,
  action,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding,
      ...style
    }
  }, (title || action) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text)'
    }
  }, title), action), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
const sizes = {
  sm: 28,
  md: 34,
  lg: 40
};
function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  active = false,
  onClick,
  label
}) {
  const [hover, setHover] = React.useState(false);
  const dim = sizes[size] || sizes.md;
  const isGhost = variant === 'ghost';
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    title: label,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: dim,
      height: dim,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-sm)',
      border: isGhost ? '1px solid transparent' : '1px solid var(--border-strong)',
      background: active ? 'var(--blue-100)' : hover ? 'var(--surface-sunken)' : isGhost ? 'transparent' : 'var(--card)',
      color: active ? 'var(--accent-primary)' : 'var(--text)',
      cursor: 'pointer',
      transition: 'background var(--duration-fast) var(--ease-standard)'
    }
  }, icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function Tag({
  children,
  onRemove,
  color = 'var(--blue-royal)'
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 8px 4px 10px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: color
    }
  }), children, onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onRemove,
    "aria-label": "Remove",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      padding: 0,
      fontSize: 13,
      lineHeight: 1
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/DonutChart.jsx
try { (() => {
const palette = ['var(--blue-900)', 'var(--blue-700)', 'var(--blue-500)', 'var(--blue-300)', 'var(--slate-300)'];
function DonutChart({
  data,
  size = 160,
  thickness = 24
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, data.map((d, i) => {
    const frac = d.value / total;
    const dash = frac * circumference;
    const offset = -cumulative * circumference;
    cumulative += frac;
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: cx,
      cy: cy,
      r: r,
      fill: "none",
      stroke: palette[i % palette.length],
      strokeWidth: thickness,
      strokeDasharray: `${dash} ${circumference - dash}`,
      strokeDashoffset: offset
    });
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 'var(--text-xs)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 2,
      background: palette[i % palette.length]
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text)',
      flex: 1
    }
  }, d.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-muted)'
    }
  }, Math.round(d.value / total * 100), "%")))));
}
Object.assign(__ds_scope, { DonutChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DonutChart.jsx", error: String((e && e.message) || e) }); }

// components/data/HeatmapCell.jsx
try { (() => {
function HeatmapCell({
  value,
  size = 22
}) {
  const alpha = 0.08 + value * 0.82;
  return /*#__PURE__*/React.createElement("div", {
    title: `${Math.round(value * 100)}%`,
    style: {
      width: size,
      height: size,
      borderRadius: 4,
      background: `rgba(44, 82, 239, ${alpha})`
    }
  });
}
Object.assign(__ds_scope, { HeatmapCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/HeatmapCell.jsx", error: String((e && e.message) || e) }); }

// components/data/LineChart.jsx
try { (() => {
function LineChart({
  series,
  width = 560,
  height = 200,
  color = 'var(--accent-primary)'
}) {
  const max = Math.max(...series.map(d => d.value));
  const min = Math.min(...series.map(d => d.value));
  const pad = 8;
  const stepX = (width - pad * 2) / (series.length - 1);
  const scaleY = v => height - pad - (v - min) / (max - min || 1) * (height - pad * 2);
  const points = series.map((d, i) => [pad + i * stepX, scaleY(d.value)]);
  const linePath = points.map((p, i) => i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1][0]},${height} L${points[0][0]},${height} Z`;
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: height,
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: "none",
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "lcFill",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: color,
    stopOpacity: "0.18"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: color,
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: areaPath,
    fill: "url(#lcFill)"
  }), /*#__PURE__*/React.createElement("path", {
    d: linePath,
    fill: "none",
    stroke: color,
    strokeWidth: "2.5",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), points.map((p, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: p[0],
    cy: p[1],
    r: "0"
  })));
}
Object.assign(__ds_scope, { LineChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/LineChart.jsx", error: String((e && e.message) || e) }); }

// components/data/PlatformIcon.jsx
try { (() => {
/* Lucide dropped brand/logo glyphs — every entry below is a verified generic
   glyph, never an assumed brand-name icon id. */
const platforms = {
  facebook: {
    icon: 'thumbs-up',
    color: 'var(--blue-royal)'
  },
  instagram: {
    icon: 'camera',
    color: 'var(--blue-sky)'
  },
  tiktok: {
    icon: 'music-2',
    color: 'var(--slate-900)'
  },
  threads: {
    icon: 'at-sign',
    color: 'var(--slate-700)'
  },
  x: {
    icon: 'hash',
    color: 'var(--slate-900)'
  },
  bluesky: {
    icon: 'cloud',
    color: 'var(--blue-400)'
  },
  linkedin: {
    icon: 'briefcase',
    color: 'var(--blue-700)'
  },
  pinterest: {
    icon: 'pin',
    color: 'var(--red)'
  },
  google: {
    icon: 'chrome',
    color: 'var(--blue-500)'
  },
  youtube: {
    icon: 'play',
    color: 'var(--red)'
  },
  twitch: {
    icon: 'gamepad-2',
    color: 'var(--blue-600)'
  }
};
function PlatformIcon({
  platform,
  size = 18
}) {
  const p = platforms[platform] || {
    icon: 'globe',
    color: 'var(--text-muted)'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size + 8,
      height: size + 8,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-sunken)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: p.color,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": p.icon,
    style: {
      width: size,
      height: size
    }
  }));
}
Object.assign(__ds_scope, { PlatformIcon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/PlatformIcon.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
function StatCard({
  label,
  value,
  delta,
  timeframe = 'vs last 28 days',
  icon
}) {
  const isNegative = typeof delta === 'string' && delta.trim().startsWith('-');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 18,
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      fontWeight: 'var(--weight-medium)'
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-3xl)',
      color: 'var(--text)',
      marginTop: 6
    }
  }, value), delta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: isNegative ? 'var(--red)' : 'var(--blue-sky)',
      marginTop: 4
    }
  }, delta, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, timeframe)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data/Table.jsx
try { (() => {
function Table({
  columns,
  rows
}) {
  return /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || 'left',
      fontSize: 'var(--text-2xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-muted)',
      fontWeight: 'var(--weight-medium)',
      padding: '8px 12px',
      borderBottom: '1px solid var(--border)'
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((row, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderBottom: '1px solid var(--border)'
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      padding: '10px 12px',
      fontSize: 'var(--text-sm)',
      color: 'var(--text)',
      textAlign: c.align || 'left',
      fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-body)'
    }
  }, row[c.key]))))));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Table.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function Dialog({
  open,
  title,
  children,
  onClose,
  footer,
  width = 480
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--surface-overlay)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width,
      background: 'var(--card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-lg)',
      color: 'var(--text)'
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: 'none',
      background: 'none',
      color: 'var(--text-muted)',
      fontSize: 18,
      cursor: 'pointer'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 22
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 22px',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function EmptyState({
  icon,
  title,
  description,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 6,
      padding: '48px 32px',
      fontFamily: 'var(--font-body)'
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-md)',
      background: 'var(--blue-100)',
      color: 'var(--accent-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-lg)',
      color: 'var(--text)'
    }
  }, title), description && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      maxWidth: 360
    }
  }, description), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
function ProgressBar({
  value,
  max = 100,
  tone = 'brand',
  label
}) {
  const pct = Math.min(100, Math.max(0, value / max * 100));
  const colors = {
    brand: 'var(--accent-primary)',
    positive: 'var(--blue-sky)',
    warning: 'var(--amber)',
    error: 'var(--red)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)'
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-muted)',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, Math.round(pct), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-sunken)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: '100%',
      background: colors[tone] || colors.brand,
      borderRadius: 'var(--radius-full)',
      transition: 'width var(--duration-slow) var(--ease-standard)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const tones = {
  neutral: {
    border: 'var(--border)',
    icon: 'info'
  },
  positive: {
    border: 'var(--blue-sky)',
    icon: 'check-circle-2'
  },
  warning: {
    border: 'var(--amber)',
    icon: 'alert-triangle'
  },
  error: {
    border: 'var(--red)',
    icon: 'alert-circle'
  }
};
function Toast({
  tone = 'neutral',
  title,
  description,
  onClose
}) {
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      width: 340,
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${t.border}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)',
      padding: '12px 14px',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text)'
    }
  }, title), description && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, description)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: 'none',
      background: 'none',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: 14,
      lineHeight: 1
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function Tooltip({
  children,
  label,
  side = 'top'
}) {
  const [open, setOpen] = React.useState(false);
  const posStyle = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 6
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: 6
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: 6
    }
  }[side];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex'
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false)
  }, children, open && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      ...posStyle,
      background: 'var(--slate-900)',
      color: '#fff',
      fontSize: 'var(--text-2xs)',
      fontFamily: 'var(--font-body)',
      padding: '5px 9px',
      borderRadius: 'var(--radius-sm)',
      whiteSpace: 'nowrap',
      boxShadow: 'var(--shadow-md)',
      zIndex: 20
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked,
  onChange,
  disabled
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 'var(--radius-sm)',
      border: `1.5px solid ${checked ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
      background: checked ? 'var(--accent-primary)' : 'var(--card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background var(--duration-fast) var(--ease-standard)',
      flexShrink: 0
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8.5L6.5 12L13 4.5",
    stroke: "white",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = 'text',
  icon,
  disabled
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-body)'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 38,
      padding: '0 12px',
      borderRadius: 'var(--radius-md)',
      background: disabled ? 'var(--surface-sunken)' : 'var(--card)',
      border: `1px solid ${error ? 'var(--red)' : focused ? 'var(--focus-ring)' : 'var(--border-strong)'}`,
      boxShadow: focused ? '0 0 0 3px var(--blue-100)' : 'none',
      transition: 'border-color var(--duration-fast) var(--ease-standard)'
    }
  }, icon, /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      flex: 1,
      fontSize: 'var(--text-sm)',
      color: 'var(--text)',
      fontFamily: 'var(--font-body)'
    }
  })), error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--red)'
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function Radio({
  label,
  checked,
  onChange,
  name
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    checked: checked,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: '50%',
      border: `1.5px solid ${checked ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: 'var(--accent-primary)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text)'
    }
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  value,
  onChange,
  options,
  placeholder
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-body)'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: onChange,
    style: {
      width: '100%',
      height: 38,
      padding: '0 32px 0 12px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-strong)',
      background: 'var(--card)',
      color: 'var(--text)',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-body)',
      appearance: 'none',
      cursor: 'pointer'
    }
  }, placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--text-muted)',
      fontSize: 10
    }
  }, "\u25BE")));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked,
  onChange,
  label,
  disabled
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      width: 36,
      height: 20,
      borderRadius: 'var(--radius-full)',
      background: checked ? 'var(--accent-primary)' : 'var(--slate-300)',
      position: 'relative',
      transition: 'background var(--duration-fast) var(--ease-standard)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: checked ? 18 : 2,
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left var(--duration-fast) var(--ease-standard)',
      boxShadow: 'var(--shadow-xs)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function Textarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  error,
  hint
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-body)'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text)'
    }
  }, label), /*#__PURE__*/React.createElement("textarea", {
    value: value,
    placeholder: placeholder,
    rows: rows,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      resize: 'vertical',
      padding: '10px 12px',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${error ? 'var(--red)' : focused ? 'var(--focus-ring)' : 'var(--border-strong)'}`,
      boxShadow: focused ? '0 0 0 3px var(--blue-100)' : 'none',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-body)',
      color: 'var(--text)',
      outline: 'none'
    }
  }), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: error ? 'var(--red)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
const items = [{
  key: 'analytics',
  label: 'Analytics',
  icon: 'bar-chart-3'
}, {
  key: 'calendar',
  label: 'Planning calendar',
  icon: 'calendar-days'
}, {
  key: 'composer',
  label: 'Post composer',
  icon: 'send'
}, {
  key: 'inbox',
  label: 'Inbox',
  icon: 'inbox'
}, {
  key: 'smartlinks',
  label: 'SmartLinks',
  icon: 'link-2'
}, {
  key: 'ads',
  label: 'Ads',
  icon: 'megaphone'
}, {
  key: 'reporting',
  label: 'Reporting',
  icon: 'file-text'
}, {
  key: 'tracker',
  label: 'Hashtag tracker',
  icon: 'hash'
}, {
  key: 'settings',
  label: 'Connections',
  icon: 'plug-zap'
}];
function Sidebar({
  active = 'analytics',
  onNavigate,
  logoSrc
}) {
  const [logoFailed, setLogoFailed] = React.useState(false);
  const showImg = logoSrc && !logoFailed;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 'var(--sidebar-w)',
      background: 'var(--surface-nav)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '18px 12px',
      gap: 2,
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '4px 8px 20px'
    }
  }, showImg ? /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "",
    onError: () => setLogoFailed(true),
    style: {
      width: 28,
      height: 28,
      borderRadius: 8
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      background: 'linear-gradient(135deg, var(--blue-royal), var(--blue-sky))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 12,
      flexShrink: 0
    }
  }, "TF"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 14,
      lineHeight: 1.2
    }
  }, "SocialSuite", /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 400,
      fontSize: 10,
      color: 'var(--text-on-dark-muted)'
    }
  }, "by TechyFuel"))), items.map(it => {
    const isActive = it.key === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      onClick: () => onNavigate && onNavigate(it.key),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        cursor: 'pointer',
        background: isActive ? 'var(--surface-nav-active)' : 'transparent',
        color: isActive ? '#fff' : 'var(--text-on-dark-muted)',
        fontSize: 'var(--text-sm)',
        fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
        textAlign: 'left',
        width: '100%',
        transition: 'background var(--duration-fast) var(--ease-standard)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": it.icon,
      style: {
        width: 16,
        height: 16,
        flexShrink: 0
      }
    }), it.label);
  }));
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  items,
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      borderBottom: '1px solid var(--border)',
      fontFamily: 'var(--font-body)'
    }
  }, items.map(it => {
    const isActive = it.key === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      onClick: () => onChange && onChange(it.key),
      style: {
        padding: '10px 14px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: 'var(--text-sm)',
        fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
        borderBottom: `2px solid ${isActive ? 'var(--accent-primary)' : 'transparent'}`,
        marginBottom: -1,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        color: 'inherit',
        opacity: 0.8
      }
    }, it.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function TopBar({
  title,
  workspace,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 'var(--topbar-h)',
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-lg)',
      color: 'var(--text)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, right, workspace));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/WorkspaceSwitcher.jsx
try { (() => {
function WorkspaceSwitcher({
  workspace,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '5px 12px 5px 5px',
      borderRadius: 'var(--radius-full)',
      border: '1px solid var(--border)',
      background: hover ? 'var(--surface-sunken)' : 'var(--card)',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      transition: 'background var(--duration-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: 'var(--blue-100)',
      color: 'var(--accent-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 12
    }
  }, workspace.initials), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text)'
    }
  }, workspace.name), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-down",
    style: {
      width: 14,
      height: 14,
      color: 'var(--text-muted)'
    }
  }));
}
Object.assign(__ds_scope, { WorkspaceSwitcher });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/WorkspaceSwitcher.jsx", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/App.jsx
try { (() => {
function App() {
  const {
    Sidebar,
    TopBar,
    WorkspaceSwitcher,
    IconButton
  } = window.SocialSuiteDesignSystem_f55d92;
  const {
    workspaces
  } = window.SSMockData;
  const [screen, setScreen] = React.useState('analytics');
  const [wsIndex, setWsIndex] = React.useState(0);
  const [wsOpen, setWsOpen] = React.useState(false);
  const titles = {
    analytics: 'Page overview',
    calendar: 'Planning calendar',
    composer: 'Post composer',
    inbox: 'Unified inbox',
    smartlinks: 'SmartLinks',
    ads: 'Ads',
    reporting: 'Reporting',
    tracker: 'Hashtag tracker',
    settings: 'Connections'
  };
  const screens = {
    analytics: window.AnalyticsScreen,
    calendar: window.CalendarScreen,
    composer: window.ComposerScreen,
    inbox: window.InboxScreen,
    smartlinks: window.SmartLinksScreen,
    ads: window.AdsScreen,
    reporting: window.ReportingScreen,
    tracker: window.TrackerScreen,
    settings: window.ConnectionsScreen
  };
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const Screen = screens[screen];
  const ws = workspaces[wsIndex];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--bg)'
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    active: screen,
    onNavigate: setScreen,
    logoSrc: "../../assets/logo/tf-mark.svg"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: titles[screen],
    right: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "bell",
        style: {
          width: 16,
          height: 16
        }
      }),
      label: "Notifications"
    }),
    workspace: /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(WorkspaceSwitcher, {
      workspace: ws,
      onClick: () => setWsOpen(o => !o)
    }), wsOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: 0,
        top: '110%',
        width: 220,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        padding: 6,
        zIndex: 30
      }
    }, workspaces.map((w, i) => /*#__PURE__*/React.createElement("button", {
      key: w.key,
      onClick: () => {
        setWsIndex(i);
        setWsOpen(false);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '8px 10px',
        border: 'none',
        background: i === wsIndex ? 'var(--surface-sunken)' : 'transparent',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'var(--blue-100)',
        color: 'var(--accent-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 10
      }
    }, w.initials), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text)'
      }
    }, w.name)))))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 24
    }
  }, Screen ? /*#__PURE__*/React.createElement(Screen, null) : null)));
}
window.App = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/mock-data.js
try { (() => {
// Shared fake data for the SocialSuite UI kit — Islamic educational institution clients.
const workspaces = [{
  key: 'hira-institute',
  initials: 'HI',
  name: 'HIRA Institute'
}, {
  key: 'hira-kitchen',
  initials: 'HK',
  name: 'HIRA Kitchen'
}, {
  key: 'al-khalil',
  initials: 'AK',
  name: 'Al Khalil Huffaz School'
}, {
  key: 'al-rehman',
  initials: 'AR',
  name: 'Al Rehman Academy'
}];
const growthSeries = [{
  value: 8400
}, {
  value: 8650
}, {
  value: 8590
}, {
  value: 8900
}, {
  value: 9200
}, {
  value: 9120
}, {
  value: 9450
}, {
  value: 9800
}, {
  value: 10120
}, {
  value: 10380
}, {
  value: 10290
}, {
  value: 10640
}, {
  value: 11050
}, {
  value: 11400
}];
const followersByCountry = [{
  label: 'Pakistan',
  value: 46
}, {
  label: 'United Kingdom',
  value: 21
}, {
  label: 'United States',
  value: 15
}, {
  label: 'United Arab Emirates',
  value: 11
}, {
  label: 'Other',
  value: 7
}];
const followersByCity = [{
  city: 'Karachi',
  country: 'Pakistan',
  followers: '18,204'
}, {
  city: 'Lahore',
  country: 'Pakistan',
  followers: '11,982'
}, {
  city: 'London',
  country: 'United Kingdom',
  followers: '6,340'
}, {
  city: 'Dubai',
  country: 'UAE',
  followers: '4,110'
}, {
  city: 'Birmingham',
  country: 'United Kingdom',
  followers: '2,860'
}, {
  city: 'Houston',
  country: 'United States',
  followers: '2,214'
}];
const platformPosts = [{
  platform: 'instagram',
  label: 'Instagram',
  posts: 18,
  reach: '42.1K'
}, {
  platform: 'facebook',
  label: 'Facebook',
  posts: 12,
  reach: '28.6K'
}, {
  platform: 'tiktok',
  label: 'TikTok',
  posts: 9,
  reach: '61.4K'
}];
const scheduledPosts = [{
  day: 1,
  hour: 9,
  platform: 'instagram',
  time: '9:00 AM',
  caption: 'Friday khutbah reminder — join us for Jummah at 1:15 PM…'
}, {
  day: 1,
  hour: 17,
  platform: 'facebook',
  time: '5:00 PM',
  caption: 'Registration for the Winter Hifz intensive closes this weekend…'
}, {
  day: 3,
  hour: 11,
  platform: 'tiktok',
  time: '11:00 AM',
  caption: 'A day in the life of a Huffaz student at Al Khalil 🎬'
}, {
  day: 4,
  hour: 15,
  platform: 'instagram',
  time: '3:00 PM',
  caption: 'New menu at HIRA Kitchen: catering trays for community iftars…'
}, {
  day: 5,
  hour: 10,
  platform: 'facebook',
  time: '10:00 AM',
  caption: 'Alumni spotlight: Class of 2019 update from Al Rehman Academy…'
}];
const connections = [{
  platform: 'facebook',
  label: 'Facebook',
  status: 'connected',
  account: 'HIRA Institute'
}, {
  platform: 'instagram',
  label: 'Instagram',
  status: 'connected',
  account: '@hira.institute'
}, {
  platform: 'threads',
  label: 'Threads',
  status: 'not-connected'
}, {
  platform: 'x',
  label: 'X',
  status: 'not-connected'
}, {
  platform: 'bluesky',
  label: 'Bluesky',
  status: 'not-connected'
}, {
  platform: 'linkedin',
  label: 'LinkedIn',
  status: 'connected',
  account: 'HIRA Institute'
}, {
  platform: 'pinterest',
  label: 'Pinterest',
  status: 'not-connected'
}, {
  platform: 'tiktok',
  label: 'TikTok (personal)',
  status: 'connected',
  account: '@hira.moments'
}, {
  platform: 'tiktok',
  label: 'TikTok (business)',
  status: 'pending',
  account: 'Reconnect required'
}, {
  platform: 'google',
  label: 'Google Business Profile',
  status: 'connected',
  account: 'HIRA Institute — Karachi'
}, {
  platform: 'youtube',
  label: 'YouTube',
  status: 'connected',
  account: 'HIRA Institute'
}, {
  platform: 'twitch',
  label: 'Twitch',
  status: 'not-connected'
}, {
  platform: 'facebook',
  label: 'Meta Ads',
  status: 'connected',
  account: 'Ad account 8834'
}, {
  platform: 'google',
  label: 'Google Ads',
  status: 'not-connected'
}, {
  platform: 'tiktok',
  label: 'TikTok Ads',
  status: 'not-connected'
}];
const conversations = [{
  id: 1,
  platform: 'instagram',
  name: 'Ayesha Raza',
  preview: 'Assalamu alaikum, what time does registration open tomorrow?',
  time: '2m',
  unread: true,
  resolved: false
}, {
  id: 2,
  platform: 'facebook',
  name: 'Bilal Ahmed',
  preview: 'Is the Hifz program open to transfer students mid-year?',
  time: '18m',
  unread: true,
  resolved: false
}, {
  id: 3,
  platform: 'tiktok',
  name: '@sana.k',
  preview: 'This video made me tear up, jazakAllah khair for sharing 🤍',
  time: '1h',
  unread: false,
  resolved: true
}, {
  id: 4,
  platform: 'instagram',
  name: 'Umar Farooq',
  preview: 'Following up on the catering quote for a 40-person iftar',
  time: '3h',
  unread: false,
  resolved: false
}, {
  id: 5,
  platform: 'facebook',
  name: 'Zainab Sheikh',
  preview: 'Thank you for the quick response earlier!',
  time: '1d',
  unread: false,
  resolved: true
}];
const smartLinkLinks = [{
  label: 'Enroll for Winter Hifz Intensive',
  clicks: 842
}, {
  label: 'HIRA Kitchen catering menu',
  clicks: 610
}, {
  label: 'Donate — Ramadan appeal',
  clicks: 1204
}, {
  label: 'Alumni newsletter signup',
  clicks: 214
}];
const adsCampaigns = [{
  channel: 'Meta Ads',
  name: 'Winter Hifz Intensive — enrollment',
  status: 'active',
  spend: 1240,
  budget: 2000
}, {
  channel: 'Google Ads',
  name: 'HIRA Institute — brand search',
  status: 'active',
  spend: 380,
  budget: 500
}, {
  channel: 'TikTok Ads',
  name: 'Ramadan appeal awareness',
  status: 'paused',
  spend: 900,
  budget: 900
}, {
  channel: 'Meta Ads',
  name: 'Al Rehman Academy open house',
  status: 'active',
  spend: 210,
  budget: 750
}];
const trackerSessions = [{
  hashtag: '#HIRAOpenDay',
  platform: 'Instagram',
  status: 'active',
  started: '2026-07-01',
  mentions: 312
}, {
  hashtag: '#WinterHifz2026',
  platform: 'TikTok',
  status: 'active',
  started: '2026-06-18',
  mentions: 894
}, {
  hashtag: '#AlRehmanAlumni',
  platform: 'Facebook',
  status: 'completed',
  started: '2026-05-02',
  mentions: 156
}, {
  hashtag: '#RamadanAppeal',
  platform: 'All platforms',
  status: 'completed',
  started: '2026-03-10',
  mentions: 2140
}];
Object.assign(__ds_scope, { workspaces, growthSeries, followersByCountry, followersByCity, platformPosts, scheduledPosts, connections, conversations, smartLinkLinks, adsCampaigns, trackerSessions });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/mock-data.js", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/screens/AdsScreen.jsx
try { (() => {
function AdsScreen() {
  const {
    ProgressBar,
    Badge,
    Select
  } = window.SocialSuiteDesignSystem_f55d92;
  const {
    adsCampaigns
  } = window.SSMockData;
  const channelIcon = {
    'Meta Ads': 'facebook',
    'Google Ads': 'chrome',
    'TikTok Ads': 'music-2'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-2xl)',
      color: 'var(--text)'
    }
  }, "Ads"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "Meta, Google and TikTok campaigns for HIRA Institute")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 180
    }
  }, /*#__PURE__*/React.createElement(Select, {
    value: "28d",
    onChange: () => {},
    options: [{
      value: '7d',
      label: 'Last 7 days'
    }, {
      value: '28d',
      label: 'Last 28 days'
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, adsCampaigns.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 16,
      display: 'grid',
      gridTemplateColumns: '140px 1fr 140px 200px',
      gap: 16,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": channelIcon[c.channel],
    style: {
      width: 16,
      height: 16,
      color: 'var(--accent-primary)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, c.channel)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--text)'
    }
  }, c.name), /*#__PURE__*/React.createElement(Badge, {
    tone: c.status === 'active' ? 'positive' : 'neutral',
    dot: true
  }, c.status === 'active' ? 'Active' : 'Paused'), /*#__PURE__*/React.createElement(ProgressBar, {
    value: c.spend,
    max: c.budget,
    label: `$${c.spend.toLocaleString()} / $${c.budget.toLocaleString()}`,
    tone: c.spend >= c.budget ? 'warning' : 'brand'
  })))));
}
window.AdsScreen = AdsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/screens/AdsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/screens/AnalyticsScreen.jsx
try { (() => {
function AnalyticsScreen() {
  const {
    StatCard,
    LineChart,
    DonutChart,
    Table,
    Select,
    PlatformIcon
  } = window.SocialSuiteDesignSystem_f55d92;
  const {
    growthSeries,
    followersByCountry,
    followersByCity,
    platformPosts
  } = window.SSMockData;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-2xl)',
      color: 'var(--text)'
    }
  }, "Page overview"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "HIRA Institute \xB7 all connected platforms")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 180
    }
  }, /*#__PURE__*/React.createElement(Select, {
    value: "28d",
    onChange: () => {},
    options: [{
      value: '7d',
      label: 'Last 7 days'
    }, {
      value: '28d',
      label: 'Last 28 days'
    }, {
      value: '90d',
      label: 'Last 90 days'
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Followers",
    value: "11,400",
    delta: "+12.4%"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Profile views",
    value: "48,210",
    delta: "+6.1%"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Website visits",
    value: "3,982",
    delta: "-1.8%"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      color: 'var(--text)'
    }
  }, "Growth"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--blue-sky)'
    }
  }, "+35.7% over 28 days")), /*#__PURE__*/React.createElement(LineChart, {
    series: growthSeries,
    height: 180
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.3fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      color: 'var(--text)',
      marginBottom: 14
    }
  }, "Followers by country"), /*#__PURE__*/React.createElement(DonutChart, {
    data: followersByCountry,
    size: 140,
    thickness: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      color: 'var(--text)',
      marginBottom: 10
    }
  }, "Followers by city"), /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: 'city',
      label: 'City'
    }, {
      key: 'country',
      label: 'Country'
    }, {
      key: 'followers',
      label: 'Followers',
      align: 'right',
      mono: true
    }],
    rows: followersByCity
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      color: 'var(--text)',
      marginBottom: 14
    }
  }, "Posts published"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24
    }
  }, platformPosts.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.platform,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    platform: p.platform
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-lg)',
      color: 'var(--text)'
    }
  }, p.posts), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-muted)'
    }
  }, p.reach, " reach")))))));
}
window.AnalyticsScreen = AnalyticsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/screens/AnalyticsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/screens/CalendarScreen.jsx
try { (() => {
function CalendarScreen() {
  const {
    IconButton,
    PlatformIcon,
    Badge
  } = window.SocialSuiteDesignSystem_f55d92;
  const {
    scheduledPosts
  } = window.SSMockData;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  // deterministic pseudo-random heat so it's stable across renders
  function heat(day, hour) {
    const seed = (day * 13 + hour * 7) % 23;
    return Math.min(1, seed / 22);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-2xl)',
      color: 'var(--text)'
    }
  }, "Planning calendar"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "Week of Jul 13 \u2013 Jul 19, 2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "chevron-left",
      style: {
        width: 16,
        height: 16
      }
    }),
    label: "Previous week"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "chevron-right",
      style: {
        width: 16,
        height: 16
      }
    }),
    label: "Next week"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      color: 'var(--text)'
    }
  }, "Best time to post"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-muted)'
    }
  }, "% of audience online")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `48px repeat(${days.length}, 1fr)`,
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", null), days.map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      textAlign: 'center',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-muted)',
      fontWeight: 600
    }
  }, d)), hours.map(h => /*#__PURE__*/React.createElement(React.Fragment, {
    key: h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text-muted)',
      display: 'flex',
      alignItems: 'center'
    }
  }, h, ":00"), days.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      height: 16,
      borderRadius: 4,
      background: `rgba(44, 82, 239, ${0.08 + heat(i, h) * 0.82})`
    },
    title: `${Math.round(heat(i, h) * 100)}%`
  })))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      color: 'var(--text)',
      marginBottom: 10
    }
  }, "Scheduled this week"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, scheduledPosts.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    platform: p.platform
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 92,
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, days[p.day], " \xB7 ", p.time), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 'var(--text-sm)',
      color: 'var(--text)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, p.caption), /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, "Scheduled"))))));
}
window.CalendarScreen = CalendarScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/screens/CalendarScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/screens/ComposerScreen.jsx
try { (() => {
function ComposerScreen() {
  const {
    Button,
    IconButton,
    Radio,
    Textarea,
    Switch,
    PlatformIcon,
    Tag,
    Badge
  } = window.SocialSuiteDesignSystem_f55d92;
  const [postType, setPostType] = React.useState('post');
  const [selected, setSelected] = React.useState(['instagram', 'facebook']);
  const [preview, setPreview] = React.useState('mobile');
  const [autoPublish, setAutoPublish] = React.useState(true);
  const caption = "Registration for the Winter Hifz Intensive closes this weekend. Reserve your child's seat before spots fill up — link in bio for details and payment plans.";
  const limit = 2200;
  const over = caption.length > limit;
  const platforms = ['facebook', 'instagram', 'tiktok'];
  function toggle(p) {
    setSelected(s => s.includes(p) ? s.filter(x => x !== p) : [...s, p]);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1.4,
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-2xl)',
      color: 'var(--text)'
    }
  }, "New post"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Save as draft"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    disabled: over
  }, "Schedule"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text)',
      marginBottom: 10
    }
  }, "Platforms"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, platforms.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => toggle(p),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      border: `1.5px solid ${selected.includes(p) ? 'var(--accent-primary)' : 'var(--border)'}`,
      background: selected.includes(p) ? 'var(--blue-50)' : 'var(--card)'
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    platform: p,
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      textTransform: 'capitalize',
      color: 'var(--text)'
    }
  }, p))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text)',
      marginBottom: 10
    }
  }, "Post type"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "type",
    label: "Post",
    checked: postType === 'post',
    onChange: () => setPostType('post')
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "type",
    label: "Reel",
    checked: postType === 'reel',
    onChange: () => setPostType('reel')
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "type",
    label: "Story",
    checked: postType === 'story',
    onChange: () => setPostType('story')
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text)'
    }
  }, "Caption"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    color: "var(--blue-sky)"
  }, "Preset: Enrollment"))), /*#__PURE__*/React.createElement(Textarea, {
    value: caption,
    rows: 5,
    readOnly: true,
    onChange: () => {},
    error: over ? `Exceeds Instagram's ${limit.toLocaleString()}-character limit by ${caption.length - limit} characters` : undefined,
    hint: !over ? `${caption.length.toLocaleString()} / ${limit.toLocaleString()} characters` : undefined
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 18,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text)'
    }
  }, "Auto-publish"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, autoPublish ? 'This post goes live at the scheduled time.' : 'You will be notified to publish this manually.')), /*#__PURE__*/React.createElement(Switch, {
    checked: autoPublish,
    onChange: setAutoPublish
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'sticky',
      top: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text)'
    }
  }, "Live preview"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    size: "sm",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "smartphone",
      style: {
        width: 14,
        height: 14
      }
    }),
    label: "Mobile preview",
    active: preview === 'mobile',
    onClick: () => setPreview('mobile')
  }), /*#__PURE__*/React.createElement(IconButton, {
    size: "sm",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "monitor",
      style: {
        width: 14,
        height: 14
      }
    }),
    label: "Desktop preview",
    active: preview === 'desktop',
    onClick: () => setPreview('desktop')
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--slate-900)',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
      width: preview === 'mobile' ? 220 : '100%',
      margin: preview === 'mobile' ? '0 auto' : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: 'var(--blue-100)',
      color: 'var(--accent-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 11
    }
  }, "HI"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--text)'
    }
  }, "hira.institute")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: preview === 'mobile' ? 220 : 260,
      background: 'var(--blue-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--accent-primary)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "image",
    style: {
      width: 32,
      height: 32
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      fontSize: 11,
      color: 'var(--text)',
      lineHeight: 1.5
    }
  }, caption.slice(0, 120), "\u2026")))));
}
window.ComposerScreen = ComposerScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/screens/ComposerScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/screens/ConnectionsScreen.jsx
try { (() => {
function ConnectionsScreen() {
  const {
    Button,
    Badge,
    PlatformIcon
  } = window.SocialSuiteDesignSystem_f55d92;
  const {
    connections
  } = window.SSMockData;
  const statusTone = {
    connected: 'positive',
    pending: 'warning',
    'not-connected': 'neutral'
  };
  const statusLabel = {
    connected: 'Connected',
    pending: 'Reconnect needed',
    'not-connected': 'Not connected'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-2xl)',
      color: 'var(--text)'
    }
  }, "Connections"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "Platforms available to HIRA Institute")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 14
    }
  }, connections.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    platform: c.platform
  }), /*#__PURE__*/React.createElement(Badge, {
    tone: statusTone[c.status],
    dot: true
  }, statusLabel[c.status])), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text)'
    }
  }, c.label), c.account && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-muted)'
    }
  }, c.account), /*#__PURE__*/React.createElement("div", null, c.status === 'not-connected' && /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary"
  }, "Connect"), c.status === 'pending' && /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary"
  }, "Reconnect"), c.status === 'connected' && /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost"
  }, "Manage"))))));
}
window.ConnectionsScreen = ConnectionsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/screens/ConnectionsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/screens/InboxScreen.jsx
try { (() => {
function InboxScreen() {
  const {
    Tabs,
    PlatformIcon,
    Badge
  } = window.SocialSuiteDesignSystem_f55d92;
  const {
    conversations
  } = window.SSMockData;
  const [tab, setTab] = React.useState('unresolved');
  const [activeId, setActiveId] = React.useState(1);
  const filtered = conversations.filter(c => {
    if (tab === 'unresolved') return !c.resolved;
    if (tab === 'unread') return c.unread;
    return true;
  });
  const active = conversations.find(c => c.id === activeId) || filtered[0];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-2xl)',
      color: 'var(--text)'
    }
  }, "Unified inbox"), /*#__PURE__*/React.createElement(Tabs, {
    items: [{
      key: 'unresolved',
      label: 'Unresolved',
      count: conversations.filter(c => !c.resolved).length
    }, {
      key: 'unread',
      label: 'Unread',
      count: conversations.filter(c => c.unread).length
    }, {
      key: 'all',
      label: 'All',
      count: conversations.length
    }],
    active: tab,
    onChange: setTab
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      flex: 1,
      minHeight: 320
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 300,
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      background: 'var(--surface-card)'
    }
  }, filtered.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    onClick: () => setActiveId(c.id),
    style: {
      display: 'flex',
      gap: 10,
      padding: '12px 14px',
      cursor: 'pointer',
      background: active && active.id === c.id ? 'var(--blue-50)' : 'transparent',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    platform: c.platform,
    size: 14
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: c.unread ? 700 : 500,
      color: 'var(--text)'
    }
  }, c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text-muted)'
    }
  }, c.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, c.preview)), c.unread && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'var(--accent-primary)',
      flexShrink: 0,
      marginTop: 4
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-card)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, active && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    platform: active.platform
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text)'
    }
  }, active.name)), /*#__PURE__*/React.createElement(Badge, {
    tone: active.resolved ? 'positive' : 'warning',
    dot: true
  }, active.resolved ? 'Resolved' : 'Unresolved')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      maxWidth: 320,
      fontSize: 'var(--text-sm)',
      color: 'var(--text)'
    }
  }, active.preview)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, "Reply to ", active.name, "\u2026"))))));
}
window.InboxScreen = InboxScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/screens/InboxScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/screens/ReportingScreen.jsx
try { (() => {
function ReportingScreen() {
  const {
    Button,
    Card,
    Badge
  } = window.SocialSuiteDesignSystem_f55d92;
  const reports = [{
    icon: 'file-text',
    title: 'PDF report',
    desc: 'Branded performance summary for a client stakeholder.'
  }, {
    icon: 'presentation',
    title: 'PPT report',
    desc: 'Slide deck export for review meetings.'
  }, {
    icon: 'layout-dashboard',
    title: 'Campaign dashboard',
    desc: 'Live shareable dashboard link, no login required.'
  }, {
    icon: 'bar-chart-2',
    title: 'Custom chart builder',
    desc: 'Pick metrics, date range and chart type.'
  }];
  const recent = [{
    name: 'HIRA Institute — June performance',
    kind: 'PDF',
    date: 'Jul 02, 2026',
    status: 'sent'
  }, {
    name: 'Al Rehman Academy — Q2 overview',
    kind: 'PPT',
    date: 'Jun 28, 2026',
    status: 'draft'
  }, {
    name: 'HIRA Kitchen — campaign recap',
    kind: 'PDF',
    date: 'Jun 14, 2026',
    status: 'sent'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-2xl)',
      color: 'var(--text)'
    }
  }, "Reporting"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 14
    }
  }, reports.map((r, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    padding: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--blue-100)',
      color: 'var(--accent-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": r.icon,
    style: {
      width: 18,
      height: 18
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text)'
    }
  }, r.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      marginTop: 4,
      marginBottom: 12
    }
  }, r.desc), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    fullWidth: true
  }, "Create")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text)',
      marginBottom: 10
    }
  }, "Recent reports"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, recent.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "file-text",
    style: {
      width: 16,
      height: 16,
      color: 'var(--text-muted)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 'var(--text-sm)',
      color: 'var(--text)'
    }
  }, r.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-muted)'
    }
  }, r.kind, " \xB7 ", r.date), /*#__PURE__*/React.createElement(Badge, {
    tone: r.status === 'sent' ? 'positive' : 'neutral',
    dot: true
  }, r.status === 'sent' ? 'Sent' : 'Draft'))))));
}
window.ReportingScreen = ReportingScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/screens/ReportingScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/screens/SmartLinksScreen.jsx
try { (() => {
function SmartLinksScreen() {
  const {
    Button,
    IconButton
  } = window.SocialSuiteDesignSystem_f55d92;
  const {
    smartLinkLinks
  } = window.SSMockData;
  const totalClicks = smartLinkLinks.reduce((s, l) => s + l.clicks, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1.4,
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-2xl)',
      color: 'var(--text)'
    }
  }, "SmartLinks"), /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "Add link")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text)',
      marginBottom: 12
    }
  }, "Links"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, smartLinkLinks.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 12px',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text)',
      fontWeight: 500
    }
  }, l.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--blue-sky)'
    }
  }, l.clicks.toLocaleString(), " clicks"), /*#__PURE__*/React.createElement(IconButton, {
    size: "sm",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "grip-vertical",
      style: {
        width: 14,
        height: 14
      }
    }),
    label: "Reorder"
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text)',
      marginBottom: 4
    }
  }, "Click analytics"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-3xl)',
      color: 'var(--text)'
    }
  }, totalClicks.toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--blue-sky)'
    }
  }, "+18.2% vs last 28 days"))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 260
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text)',
      marginBottom: 10
    }
  }, "Phone preview"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--slate-900)',
      borderRadius: 'var(--radius-xl)',
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(180deg, var(--blue-royal), var(--blue-sky))',
      borderRadius: 'var(--radius-lg)',
      padding: '28px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: 'var(--accent-primary)'
    }
  }, "HI"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 14
    }
  }, "HIRA Institute"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, smartLinkLinks.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: 'rgba(255,255,255,0.92)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      fontSize: 11,
      color: 'var(--text)',
      textAlign: 'center',
      fontWeight: 500
    }
  }, l.label)))))));
}
window.SmartLinksScreen = SmartLinksScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/screens/SmartLinksScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/socialsuite/screens/TrackerScreen.jsx
try { (() => {
function TrackerScreen() {
  const {
    Button,
    Input,
    Select,
    Badge,
    Table
  } = window.SocialSuiteDesignSystem_f55d92;
  const {
    trackerSessions
  } = window.SSMockData;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--text-2xl)',
      color: 'var(--text)'
    }
  }, "Hashtag tracker"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text)',
      marginBottom: 12
    }
  }, "Start a new tracking session"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr auto',
      gap: 12,
      alignItems: 'end'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Hashtag",
    placeholder: "#HIRAOpenDay"
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Platform",
    options: [{
      value: 'instagram',
      label: 'Instagram'
    }, {
      value: 'tiktok',
      label: 'TikTok'
    }, {
      value: 'all',
      label: 'All platforms'
    }]
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Duration",
    options: [{
      value: '7',
      label: '7 days'
    }, {
      value: '30',
      label: '30 days'
    }, {
      value: '90',
      label: '90 days'
    }]
  }), /*#__PURE__*/React.createElement(Button, null, "Start tracking"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text)',
      marginBottom: 10
    }
  }, "Sessions"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)',
      padding: '6px 18px'
    }
  }, /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: 'hashtag',
      label: 'Hashtag',
      mono: true
    }, {
      key: 'platform',
      label: 'Platform'
    }, {
      key: 'started',
      label: 'Started',
      mono: true
    }, {
      key: 'mentions',
      label: 'Mentions',
      align: 'right',
      mono: true
    }, {
      key: 'status',
      label: 'Status'
    }],
    rows: trackerSessions.map(s => ({
      ...s,
      mentions: s.mentions.toLocaleString(),
      status: /*#__PURE__*/React.createElement(Badge, {
        tone: s.status === 'active' ? 'positive' : 'neutral',
        dot: true
      }, s.status === 'active' ? 'Active' : 'Completed')
    }))
  }))));
}
window.TrackerScreen = TrackerScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/socialsuite/screens/TrackerScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.DonutChart = __ds_scope.DonutChart;

__ds_ns.HeatmapCell = __ds_scope.HeatmapCell;

__ds_ns.LineChart = __ds_scope.LineChart;

__ds_ns.PlatformIcon = __ds_scope.PlatformIcon;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.TopBar = __ds_scope.TopBar;

__ds_ns.WorkspaceSwitcher = __ds_scope.WorkspaceSwitcher;

})();
