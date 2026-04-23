// Tiny stroke-line icon set. SVG paths live in one object so icon names stay
// a flat string API across the codebase. Sized on a 20×20 viewBox.

const PATHS = {
  home:      (<><path d="M3 10.5 10 4l7 6.5V17a1 1 0 0 1-1 1h-3v-5h-6v5H4a1 1 0 0 1-1-1v-6.5Z" /></>),
  queue:     (<><path d="M4 6h12M4 10h12M4 14h8" /></>),
  archive:   (<><rect x="3" y="4" width="14" height="4" rx="1" /><path d="M4 8v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8M8 11h4" /></>),
  dropped:   (<><path d="M10 4v8m0 3.5v.5M3.5 16.5 10 4l6.5 12.5Z" /></>),
  persona:   (<><circle cx="10" cy="8" r="3" /><path d="M4 17c1-3 3.5-4.5 6-4.5S15 14 16 17" /></>),
  settings:  (<><circle cx="10" cy="10" r="2.5" /><path d="m10 2 .7 2.3 2.4-.6 1 2.2 2.2 1-.6 2.4L18 10l-2.3.7.6 2.4-2.2 1-1 2.2-2.4-.6L10 18l-.7-2.3-2.4.6-1-2.2L3.7 13 2 12l2.3-.7-.6-2.4 2.2-1 1-2.2 2.4.6L10 2Z" /></>),
  search:    (<><circle cx="9" cy="9" r="5" /><path d="m13.5 13.5 3 3" /></>),
  bell:      (<><path d="M6 8a4 4 0 1 1 8 0v3l1.5 2.5H4.5L6 11V8Z" /><path d="M8.5 16a1.5 1.5 0 0 0 3 0" /></>),
  sun:       (<><circle cx="10" cy="10" r="3.5" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" /></>),
  moon:      (<><path d="M15 12a5 5 0 0 1-7-7 6 6 0 1 0 7 7Z" /></>),
  chevron_r: (<><path d="m8 5 5 5-5 5" /></>),
  chevron_d: (<><path d="m5 8 5 5 5-5" /></>),
  check:     (<><path d="m4 10 4 4 8-8" /></>),
  x:         (<><path d="M5 5l10 10M15 5 5 15" /></>),
  alert:     (<><path d="M10 4v6m0 3v.5" /><circle cx="10" cy="10" r="7" /></>),
  external:  (<><path d="M7 4H4v12h12v-3M10 4h6v6M9 11l7-7" /></>),
  clock:     (<><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 2" /></>),
  rss:       (<><path d="M4 4a12 12 0 0 1 12 12M4 9a7 7 0 0 1 7 7" /><circle cx="5" cy="15" r="1.2" /></>),
  image:     (<><rect x="3" y="4" width="14" height="12" rx="1.5" /><circle cx="7.5" cy="8.5" r="1.2" /><path d="m4 14 4-4 4 4 2-2 2 2" /></>),
  fb:        (<><path d="M12 3h2v3h-2c-.6 0-1 .4-1 1v2h3l-.5 3H11v5H8v-5H6v-3h2V7c0-2.2 1.8-4 4-4Z" /></>),
  ig:        (<><rect x="3" y="3" width="14" height="14" rx="4" /><circle cx="10" cy="10" r="3.5" /><circle cx="14" cy="6" r="0.8" fill="currentColor" /></>),
  th:        (<><path d="M10 3c-4 0-7 2.5-7 7s3 7 7 7c3 0 5.5-2 6-5-2 1.5-4 1.5-5 0-1-1.5 0-3 1.5-3s3 1 2 4" /></>),
  heart:     (<><path d="M10 16s-6-3.5-6-8a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4.5-6 8-6 8Z" /></>),
  comment:   (<><path d="M4 5h12v9h-5l-3 3v-3H4V5Z" /></>),
  share:     (<><circle cx="5" cy="10" r="2" /><circle cx="15" cy="5" r="2" /><circle cx="15" cy="15" r="2" /><path d="m7 9 6-3M7 11l6 3" /></>),
  save:      (<><path d="M5 4h10v13l-5-3-5 3V4Z" /></>),
  views:     (<><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" /><circle cx="10" cy="10" r="2.5" /></>),
  play:      (<><path d="M6 4v12l10-6L6 4Z" fill="currentColor" stroke="none" /></>),
  trend_up:  (<><path d="M3 14l5-5 3 3 6-6M13 6h4v4" /></>),
  filter:    (<><path d="M3 5h14M5 10h10M8 15h4" /></>),
  tag:       (<><path d="M3 3h7l7 7-7 7-7-7V3Z" /><circle cx="7" cy="7" r="1.2" fill="currentColor" /></>),
  info:      (<><circle cx="10" cy="10" r="7" /><path d="M10 9v5M10 6v.5" /></>),
  refresh:   (<><path d="M4 10a6 6 0 0 1 10-4.2L16 4v4h-4M16 10a6 6 0 0 1-10 4.2L4 16v-4h4" /></>),
};

export function Icon({ name, size = 16, stroke = "currentColor", strokeWidth = 1.6, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
