const Icon = ({ name, className = 'w-4 h-4', ...props }) => {
  const baseSvgProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    ...props,
  };

  switch (name) {
    case 'WhatsApp':
      return <svg viewBox="0 0 24 24" className={className} fill="currentColor" {...props}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.222 5.222 0 0 0-.571-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>;
    case 'Instagram':
      return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
    case 'Home':
      return <svg {...baseSvgProps}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case 'Radio':
      return <svg {...baseSvgProps}><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M7.76 16.24a6 6 0 0 1 0-8.49" /><path d="M4.93 19.07a10 10 0 0 1 0-14.14" /></svg>;
    case 'Copy':
      return <svg {...baseSvgProps}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
    case 'Crown':
      return <svg {...baseSvgProps}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" /></svg>;
    case 'Music':
      return <svg {...baseSvgProps}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
    case 'ListMusic':
      return <svg {...baseSvgProps}><path d="M21 15V6M18 5l3-1v8" /><path d="M12 12H3M16 6H3M12 18H3" /><circle cx="16" cy="18" r="2" /></svg>;
    case 'PlusCircle':
      return <svg {...baseSvgProps}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
    case 'Activity':
      return <svg {...baseSvgProps}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    case 'Users':
      return <svg {...baseSvgProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'BarChart3':
      return <svg {...baseSvgProps}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case 'Settings':
      return <svg {...baseSvgProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    case 'Zap':
      return <svg {...baseSvgProps}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case 'Headphones':
      return <svg {...baseSvgProps}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>;
    case 'Clock':
      return <svg {...baseSvgProps}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    case 'Search':
      return <svg {...baseSvgProps}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    case 'Plus':
      return <svg {...baseSvgProps}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case 'X':
      return <svg {...baseSvgProps}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    case 'ChevronUp':
      return <svg {...baseSvgProps}><polyline points="18 15 12 9 6 15" /></svg>;
    case 'ChevronDown':
      return <svg {...baseSvgProps}><polyline points="6 9 12 15 18 9" /></svg>;
    case 'ChevronLeft':
      return <svg {...baseSvgProps}><polyline points="15 18 9 12 15 6" /></svg>;
    case 'ChevronRight':
      return <svg {...baseSvgProps}><polyline points="9 18 15 12 9 6" /></svg>;
    case 'Shuffle':
      return <svg {...baseSvgProps}><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>;
    case 'SkipBack':
      return <svg {...baseSvgProps}><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" /></svg>;
    case 'Play':
      return <svg {...baseSvgProps}><polygon points="5 3 19 12 5 21 5 3" /></svg>;
    case 'Pause':
      return <svg {...baseSvgProps}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
    case 'SkipForward':
      return <svg {...baseSvgProps}><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>;
    case 'Repeat':
      return <svg {...baseSvgProps}><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>;
    case 'Volume2':
      return <svg {...baseSvgProps}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>;
    case 'VolumeX':
      return <svg {...baseSvgProps}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="15" y1="9" x2="21" y2="15" /><line x1="21" y1="9" x2="15" y2="15" /></svg>;
    case 'Share':
      return <svg {...baseSvgProps}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
    case 'MoreVertical':
      return <svg {...baseSvgProps}><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>;
    case 'ArrowUp':
      return <svg {...baseSvgProps}><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>;
    case 'Link':
      return <svg {...baseSvgProps}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
    case 'PlayCircle':
      return <svg {...baseSvgProps}><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>;
    case 'ThumbsUp':
      return <svg {...baseSvgProps}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>;
    case 'ThumbsDown':
      return <svg {...baseSvgProps}><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" /></svg>;
    case 'Smile':
      return <svg {...baseSvgProps}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>;
    case 'Video':
      return <svg {...baseSvgProps}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>;
    case 'VideoOff':
      return <svg {...baseSvgProps}><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10l-2.66-1.9" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
    case 'Info':
      return <svg {...baseSvgProps}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
    case 'AlertCircle':
      return <svg {...baseSvgProps}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
    case 'Shield':
      return <svg {...baseSvgProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case 'Trash2':
      return <svg {...baseSvgProps}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
    default:
      return null;
  }
};

export const Home = (p) => <Icon name="Home" {...p} />;
export const Radio = (p) => <Icon name="Radio" {...p} />;
export const Copy = (p) => <Icon name="Copy" {...p} />;
export const Crown = (p) => <Icon name="Crown" {...p} />;
export const Music = (p) => <Icon name="Music" {...p} />;
export const ListMusic = (p) => <Icon name="ListMusic" {...p} />;
export const PlusCircle = (p) => <Icon name="PlusCircle" {...p} />;
export const Activity = (p) => <Icon name="Activity" {...p} />;
export const Users = (p) => <Icon name="Users" {...p} />;
export const BarChart3 = (p) => <Icon name="BarChart3" {...p} />;
export const Settings = (p) => <Icon name="Settings" {...p} />;
export const Zap = (p) => <Icon name="Zap" {...p} />;
export const Headphones = (p) => <Icon name="Headphones" {...p} />;
export const Search = (p) => <Icon name="Search" {...p} />;
export const Plus = (p) => <Icon name="Plus" {...p} />;
export const X = (p) => <Icon name="X" {...p} />;
export const ChevronUp = (p) => <Icon name="ChevronUp" {...p} />;
export const ChevronDown = (p) => <Icon name="ChevronDown" {...p} />;
export const ChevronLeft = (p) => <Icon name="ChevronLeft" {...p} />;
export const ChevronRight = (p) => <Icon name="ChevronRight" {...p} />;
export const Shuffle = (p) => <Icon name="Shuffle" {...p} />;
export const SkipBack = (p) => <Icon name="SkipBack" {...p} />;
export const Play = (p) => <Icon name="Play" {...p} />;
export const Pause = (p) => <Icon name="Pause" {...p} />;
export const SkipForward = (p) => <Icon name="SkipForward" {...p} />;
export const Repeat = (p) => <Icon name="Repeat" {...p} />;
export const Volume2 = (p) => <Icon name="Volume2" {...p} />;
export const VolumeX = (p) => <Icon name="VolumeX" {...p} />;
export const Share = (p) => <Icon name="Share" {...p} />;
export const MoreVertical = (p) => <Icon name="MoreVertical" {...p} />;
export const ArrowUp = (p) => <Icon name="ArrowUp" {...p} />;
export const Link = (p) => <Icon name="Link" {...p} />;
export const PlayCircle = (p) => <Icon name="PlayCircle" {...p} />;
export const ThumbsUp = (p) => <Icon name="ThumbsUp" {...p} />;
export const ThumbsDown = (p) => <Icon name="ThumbsDown" {...p} />;
export const Smile = (p) => <Icon name="Smile" {...p} />;
export const Video = (p) => <Icon name="Video" {...p} />;
export const VideoOff = (p) => <Icon name="VideoOff" {...p} />;
export const Info = (p) => <Icon name="Info" {...p} />;
export const AlertCircle = (p) => <Icon name="AlertCircle" {...p} />;
export const Shield = (p) => <Icon name="Shield" {...p} />;
export const Trash2 = (p) => <Icon name="Trash2" {...p} />;
export const WhatsApp = (p) => <Icon name="WhatsApp" {...p} />;
export const Instagram = (p) => <Icon name="Instagram" {...p} />;
export const Clock = (p) => <Icon name="Clock" {...p} />;
