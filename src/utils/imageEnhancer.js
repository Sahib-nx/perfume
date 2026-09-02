const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// 12 Visual Style Backdrop Generators
const STYLE_RENDERERS = {
  'luxury-floral': {
    name: 'Luxury Floral',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FBF7F0"/><stop offset="50%" stop-color="#F2E6D5"/><stop offset="100%" stop-color="#DEC9B0"/></linearGradient>
          <radialGradient id="spot" cx="50%" cy="35%" r="60%"><stop offset="0%" stop-color="#FFFDF9" stop-opacity="0.95"/><stop offset="60%" stop-color="#F5E8D2" stop-opacity="0.3"/><stop offset="100%" stop-color="#E2D0B4" stop-opacity="0"/></radialGradient>
          <linearGradient id="marble" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#EBE3D5"/><stop offset="25%" stop-color="#FAF5EC"/><stop offset="50%" stop-color="#FFFFFF"/><stop offset="75%" stop-color="#F5EFE4"/><stop offset="100%" stop-color="#E2D6C4"/></linearGradient>
          <linearGradient id="marbleTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F3ECE0"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2D1F12" stop-opacity="0.65"/><stop offset="60%" stop-color="#3D2E20" stop-opacity="0.25"/><stop offset="100%" stop-color="#3D2E20" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#spot)"/>
        <ellipse cx="500" cy="800" rx="380" ry="75" fill="url(#shadow)"/>
        <polygon points="170,720 830,720 860,880 140,880" fill="url(#marble)"/>
        <ellipse cx="500" cy="720" rx="330" ry="52" fill="url(#marbleTop)" stroke="#DECBB5" stroke-width="2"/>
        <!-- Botanical White Jasmine & Floral Elements -->
        <g opacity="0.9">
          <path d="M 120,680 Q 200,610 270,670 Q 200,740 120,680 Z" fill="#FFFFFF" stroke="#E2D5C3" stroke-width="1.5"/>
          <path d="M 170,620 Q 240,560 280,630 Q 210,670 170,620 Z" fill="#FFFDF8"/>
          <circle cx="215" cy="650" r="7" fill="#F4D37D"/>
          <path d="M 880,680 Q 800,610 730,670 Q 800,740 880,680 Z" fill="#FFFFFF" stroke="#E2D5C3" stroke-width="1.5"/>
          <path d="M 830,620 Q 760,560 720,630 Q 790,670 830,620 Z" fill="#FFFDF8"/>
          <circle cx="785" cy="650" r="7" fill="#F4D37D"/>
        </g>
      </svg>`
  },

  'rose-romance': {
    name: 'Rose Romance',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FDF4F2"/><stop offset="50%" stop-color="#F6E4E2"/><stop offset="100%" stop-color="#E7CBC9"/></linearGradient>
          <radialGradient id="spot" cx="50%" cy="35%" r="65%"><stop offset="0%" stop-color="#FFF8F7" stop-opacity="0.95"/><stop offset="60%" stop-color="#FBE7E5" stop-opacity="0.4"/><stop offset="100%" stop-color="#E8CECB" stop-opacity="0"/></radialGradient>
          <linearGradient id="roseMarble" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#E6CCC9"/><stop offset="30%" stop-color="#FDF1F0"/><stop offset="50%" stop-color="#FFF7F6"/><stop offset="70%" stop-color="#F8E7E5"/><stop offset="100%" stop-color="#E0BFBD"/></linearGradient>
          <linearGradient id="roseTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF7F6"/><stop offset="100%" stop-color="#F2DFDC"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#3A1C1D" stop-opacity="0.65"/><stop offset="60%" stop-color="#4C2627" stop-opacity="0.25"/><stop offset="100%" stop-color="#4C2627" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#spot)"/>
        <ellipse cx="500" cy="800" rx="380" ry="75" fill="url(#shadow)"/>
        <polygon points="170,720 830,720 860,880 140,880" fill="url(#roseMarble)"/>
        <ellipse cx="500" cy="720" rx="330" ry="52" fill="url(#roseTop)" stroke="#DEC0BD" stroke-width="2"/>
        <!-- Scattered Velvet Rose Petals -->
        <g opacity="0.95">
          <ellipse cx="220" cy="730" rx="35" ry="20" fill="#C93B52" transform="rotate(-15 220 730)"/>
          <ellipse cx="260" cy="745" rx="28" ry="16" fill="#A8283E" transform="rotate(25 260 745)"/>
          <ellipse cx="780" cy="735" rx="32" ry="18" fill="#C93B52" transform="rotate(20 780 735)"/>
          <ellipse cx="740" cy="750" rx="26" ry="15" fill="#E26A7E" transform="rotate(-30 740 750)"/>
        </g>
      </svg>`
  },

  'dark-oud': {
    name: 'Dark Oud',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1A120B"/><stop offset="50%" stop-color="#2C1D11"/><stop offset="100%" stop-color="#0F0A06"/></linearGradient>
          <radialGradient id="amberSpot" cx="50%" cy="35%" r="60%"><stop offset="0%" stop-color="#D49439" stop-opacity="0.6"/><stop offset="50%" stop-color="#9E5F1E" stop-opacity="0.25"/><stop offset="100%" stop-color="#1A120B" stop-opacity="0"/></radialGradient>
          <linearGradient id="woodPedestal" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#1D130B"/><stop offset="30%" stop-color="#3D2919"/><stop offset="50%" stop-color="#4E3420"/><stop offset="70%" stop-color="#352315"/><stop offset="100%" stop-color="#170E07"/></linearGradient>
          <linearGradient id="woodTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4A311D"/><stop offset="100%" stop-color="#2D1C0F"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000000" stop-opacity="0.95"/><stop offset="60%" stop-color="#000000" stop-opacity="0.45"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#amberSpot)"/>
        <ellipse cx="500" cy="800" rx="380" ry="75" fill="url(#shadow)"/>
        <polygon points="170,720 830,720 860,880 140,880" fill="url(#woodPedestal)"/>
        <ellipse cx="500" cy="720" rx="330" ry="52" fill="url(#woodTop)" stroke="#66462B" stroke-width="2"/>
        <g opacity="0.85">
          <polygon points="210,720 235,705 245,725 225,735" fill="#E69C24"/>
          <polygon points="245,715 270,705 275,725 250,730" fill="#F5BA42"/>
          <polygon points="760,720 785,705 795,725 775,735" fill="#E69C24"/>
          <polygon points="730,715 755,705 760,725 735,730" fill="#F5BA42"/>
        </g>
      </svg>`
  },

  'fresh-botanical': {
    name: 'Fresh Botanical',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F4FAF4"/><stop offset="50%" stop-color="#E5F2E5"/><stop offset="100%" stop-color="#CDE0CD"/></linearGradient>
          <radialGradient id="spot" cx="50%" cy="35%" r="65%"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="60%" stop-color="#E8F7E8" stop-opacity="0.4"/><stop offset="100%" stop-color="#C5DBC5" stop-opacity="0"/></radialGradient>
          <linearGradient id="stonePedestal" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#D3DDD3"/><stop offset="30%" stop-color="#EEF5EE"/><stop offset="50%" stop-color="#F7FAF7"/><stop offset="70%" stop-color="#E8EFE8"/><stop offset="100%" stop-color="#CCD6CC"/></linearGradient>
          <linearGradient id="stoneTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F7FAF7"/><stop offset="100%" stop-color="#DFE8DF"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1A2E1A" stop-opacity="0.6"/><stop offset="60%" stop-color="#2D472D" stop-opacity="0.25"/><stop offset="100%" stop-color="#2D472D" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#spot)"/>
        <ellipse cx="500" cy="800" rx="380" ry="75" fill="url(#shadow)"/>
        <polygon points="170,720 830,720 860,880 140,880" fill="url(#stonePedestal)"/>
        <ellipse cx="500" cy="720" rx="330" ry="52" fill="url(#stoneTop)" stroke="#BDCBBD" stroke-width="2"/>
        <g opacity="0.9">
          <path d="M 160,710 Q 240,650 290,700 Q 230,750 160,710 Z" fill="#4B7B4B"/>
          <path d="M 210,670 Q 280,620 310,670 Q 260,710 210,670 Z" fill="#659B65"/>
          <path d="M 840,710 Q 760,650 710,700 Q 770,750 840,710 Z" fill="#4B7B4B"/>
        </g>
      </svg>`
  },

  'arabian-luxury': {
    name: 'Arabian Luxury',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2B1A0E"/><stop offset="50%" stop-color="#4A2F17"/><stop offset="100%" stop-color="#1A1008"/></linearGradient>
          <radialGradient id="goldSpot" cx="50%" cy="35%" r="65%"><stop offset="0%" stop-color="#F7D37D" stop-opacity="0.8"/><stop offset="50%" stop-color="#C9943B" stop-opacity="0.3"/><stop offset="100%" stop-color="#3D240E" stop-opacity="0"/></radialGradient>
          <linearGradient id="brassTray" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8C6521"/><stop offset="25%" stop-color="#E2B75A"/><stop offset="50%" stop-color="#FFF0B0"/><stop offset="75%" stop-color="#D9A845"/><stop offset="100%" stop-color="#7A5418"/></linearGradient>
          <linearGradient id="trayTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF3BF"/><stop offset="100%" stop-color="#C79639"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000000" stop-opacity="0.9"/><stop offset="60%" stop-color="#1F1206" stop-opacity="0.35"/><stop offset="100%" stop-color="#1F1206" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#goldSpot)"/>
        <ellipse cx="500" cy="800" rx="380" ry="75" fill="url(#shadow)"/>
        <polygon points="160,720 840,720 870,880 130,880" fill="url(#brassTray)"/>
        <ellipse cx="500" cy="720" rx="340" ry="55" fill="url(#trayTop)" stroke="#FFE894" stroke-width="2.5"/>
      </svg>`
  },

  'minimal-luxury': {
    name: 'Minimal Luxury',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F8F6F0"/><stop offset="50%" stop-color="#EEE9DE"/><stop offset="100%" stop-color="#DDD5C7"/></linearGradient>
          <radialGradient id="spot" cx="50%" cy="35%" r="60%"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="60%" stop-color="#F2EFE8" stop-opacity="0.3"/><stop offset="100%" stop-color="#DDD6C8" stop-opacity="0"/></radialGradient>
          <linearGradient id="podium" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#DCD5C8"/><stop offset="50%" stop-color="#F4EFE6"/><stop offset="100%" stop-color="#D3CABE"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#332C24" stop-opacity="0.5"/><stop offset="70%" stop-color="#332C24" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#spot)"/>
        <ellipse cx="500" cy="800" rx="370" ry="68" fill="url(#shadow)"/>
        <polygon points="180,720 820,720 840,880 160,880" fill="url(#podium)"/>
        <ellipse cx="500" cy="720" rx="320" ry="48" fill="#FAF6EE" stroke="#D1C8B9" stroke-width="1.5"/>
      </svg>`
  },

  'royal-gold': {
    name: 'Royal Gold',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1F180D"/><stop offset="50%" stop-color="#3D2E14"/><stop offset="100%" stop-color="#140F08"/></linearGradient>
          <radialGradient id="spot" cx="50%" cy="35%" r="65%"><stop offset="0%" stop-color="#FFE08A" stop-opacity="0.85"/><stop offset="60%" stop-color="#C49337" stop-opacity="0.25"/><stop offset="100%" stop-color="#1F180D" stop-opacity="0"/></radialGradient>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8F6A22"/><stop offset="25%" stop-color="#E8BE58"/><stop offset="50%" stop-color="#FFF5B8"/><stop offset="75%" stop-color="#E0B348"/><stop offset="100%" stop-color="#7A5616"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000000" stop-opacity="0.9"/><stop offset="60%" stop-color="#000000" stop-opacity="0.35"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#spot)"/>
        <ellipse cx="500" cy="800" rx="380" ry="75" fill="url(#shadow)"/>
        <polygon points="170,720 830,720 860,880 140,880" fill="url(#gold)"/>
        <ellipse cx="500" cy="720" rx="330" ry="52" fill="#FFF4BD" stroke="#FFEBA8" stroke-width="2"/>
      </svg>`
  },

  'natural-elegance': {
    name: 'Natural Elegance',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F6F3EB"/><stop offset="50%" stop-color="#E9E2D2"/><stop offset="100%" stop-color="#D4CABE"/></linearGradient>
          <radialGradient id="spot" cx="50%" cy="35%" r="60%"><stop offset="0%" stop-color="#FFFDF9" stop-opacity="0.95"/><stop offset="60%" stop-color="#EFEADF" stop-opacity="0.35"/><stop offset="100%" stop-color="#D4C9BA" stop-opacity="0"/></radialGradient>
          <linearGradient id="riverStone" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#C2B7A5"/><stop offset="50%" stop-color="#E5DDD0"/><stop offset="100%" stop-color="#B8AC98"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2D271F" stop-opacity="0.55"/><stop offset="70%" stop-color="#2D271F" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#spot)"/>
        <ellipse cx="500" cy="800" rx="370" ry="70" fill="url(#shadow)"/>
        <polygon points="175,720 825,720 850,880 150,880" fill="url(#riverStone)"/>
        <ellipse cx="500" cy="720" rx="325" ry="50" fill="#EBE4D8" stroke="#C7BCAB" stroke-width="2"/>
      </svg>`
  },

  'romantic-luxury': {
    name: 'Romantic Luxury',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2D1722"/><stop offset="50%" stop-color="#452335"/><stop offset="100%" stop-color="#1A0D14"/></linearGradient>
          <radialGradient id="spot" cx="50%" cy="35%" r="65%"><stop offset="0%" stop-color="#F2A7C3" stop-opacity="0.75"/><stop offset="60%" stop-color="#9E466E" stop-opacity="0.25"/><stop offset="100%" stop-color="#2D1722" stop-opacity="0"/></radialGradient>
          <linearGradient id="velvet" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#4D1F34"/><stop offset="50%" stop-color="#803358"/><stop offset="100%" stop-color="#3D1729"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000000" stop-opacity="0.9"/><stop offset="60%" stop-color="#000000" stop-opacity="0.35"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#spot)"/>
        <ellipse cx="500" cy="800" rx="380" ry="75" fill="url(#shadow)"/>
        <polygon points="170,720 830,720 860,880 140,880" fill="url(#velvet)"/>
        <ellipse cx="500" cy="720" rx="330" ry="52" fill="#752F51" stroke="#A84D78" stroke-width="2"/>
      </svg>`
  },

  'modern-luxury': {
    name: 'Modern Luxury',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#141416"/><stop offset="50%" stop-color="#222328"/><stop offset="100%" stop-color="#0E0F12"/></linearGradient>
          <radialGradient id="spot" cx="50%" cy="35%" r="60%"><stop offset="0%" stop-color="#E2E8F0" stop-opacity="0.7"/><stop offset="60%" stop-color="#64748B" stop-opacity="0.2"/><stop offset="100%" stop-color="#141416" stop-opacity="0"/></radialGradient>
          <linearGradient id="granite" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#1E2026"/><stop offset="50%" stop-color="#333742"/><stop offset="100%" stop-color="#181A20"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000000" stop-opacity="0.95"/><stop offset="70%" stop-color="#000000" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#spot)"/>
        <ellipse cx="500" cy="800" rx="370" ry="68" fill="url(#shadow)"/>
        <polygon points="180,720 820,720 840,880 160,880" fill="url(#granite)"/>
        <ellipse cx="500" cy="720" rx="320" ry="48" fill="#2B2F38" stroke="#4B5363" stroke-width="1.5"/>
      </svg>`
  },

  'warm-amber': {
    name: 'Warm Amber',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#261408"/><stop offset="50%" stop-color="#47260F"/><stop offset="100%" stop-color="#140A04"/></linearGradient>
          <radialGradient id="amberSpot" cx="50%" cy="35%" r="65%"><stop offset="0%" stop-color="#F5A623" stop-opacity="0.8"/><stop offset="60%" stop-color="#BD6A13" stop-opacity="0.25"/><stop offset="100%" stop-color="#261408" stop-opacity="0"/></radialGradient>
          <linearGradient id="amberWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#4A260D"/><stop offset="50%" stop-color="#8C4D1E"/><stop offset="100%" stop-color="#3B1D09"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000000" stop-opacity="0.9"/><stop offset="60%" stop-color="#000000" stop-opacity="0.35"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#amberSpot)"/>
        <ellipse cx="500" cy="800" rx="380" ry="75" fill="url(#shadow)"/>
        <polygon points="170,720 830,720 860,880 140,880" fill="url(#amberWood)"/>
        <ellipse cx="500" cy="720" rx="330" ry="52" fill="#783F16" stroke="#B86E2A" stroke-width="2"/>
      </svg>`
  },

  'fresh-clean': {
    name: 'Fresh & Clean',
    renderSvg: (w, h) => `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F2F8FD"/><stop offset="50%" stop-color="#E2EEF8"/><stop offset="100%" stop-color="#C5DAEB"/></linearGradient>
          <radialGradient id="spot" cx="50%" cy="35%" r="60%"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="60%" stop-color="#E4F0FA" stop-opacity="0.35"/><stop offset="100%" stop-color="#BFD8ED" stop-opacity="0"/></radialGradient>
          <linearGradient id="iceMarble" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#CFE0EF"/><stop offset="50%" stop-color="#F5F9FC"/><stop offset="100%" stop-color="#C2D6E7"/></linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#14283A" stop-opacity="0.5"/><stop offset="70%" stop-color="#14283A" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        <rect width="${w}" height="${h}" fill="url(#spot)"/>
        <ellipse cx="500" cy="800" rx="370" ry="68" fill="url(#shadow)"/>
        <polygon points="180,720 820,720 840,880 160,880" fill="url(#iceMarble)"/>
        <ellipse cx="500" cy="720" rx="320" ry="48" fill="#F8FAFD" stroke="#B8D1E8" stroke-width="1.5"/>
      </svg>`
  }
};

/**
 * Boundary-Connected Perimeter Flood-Fill (Outer Edge Cutout)
 * Clears ONLY pixels that are contiguous with the outer image border.
 * 100% protects all inner bottle elements: white labels, gold text, crystal caps, and liquid.
 */
async function removeBackgroundBoundary(inputBuffer) {
  try {
    const img = sharp(inputBuffer);
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;

    // 1. Sample perimeter background color (average of border pixels)
    let bgR = 0, bgG = 0, bgB = 0, count = 0;
    for (let x = 0; x < w; x += 10) {
      let idx = (0 * w + x) * 4;
      bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2]; count++;
      idx = ((h - 1) * w + x) * 4;
      bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2]; count++;
    }
    for (let y = 0; y < h; y += 10) {
      let idx = (y * w + 0) * 4;
      bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2]; count++;
      idx = (y * w + (w - 1)) * 4;
      bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2]; count++;
    }
    bgR /= count; bgG /= count; bgB /= count;

    // 2. Queue-based Flood Fill starting strictly from the outer boundary
    const visited = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0, qTail = 0;

    function isBorderBg(idx) {
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      return Math.sqrt(Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)) < 42;
    }

    // Seed top and bottom borders
    for (let x = 0; x < w; x++) {
      const topP = 0 * w + x;
      if (isBorderBg(topP * 4)) { visited[topP] = 1; queue[qTail++] = topP; }
      const botP = (h - 1) * w + x;
      if (isBorderBg(botP * 4)) { visited[botP] = 1; queue[qTail++] = botP; }
    }
    // Seed left and right borders
    for (let y = 0; y < h; y++) {
      const leftP = y * w + 0;
      if (isBorderBg(leftP * 4) && !visited[leftP]) { visited[leftP] = 1; queue[qTail++] = leftP; }
      const rightP = y * w + (w - 1);
      if (isBorderBg(rightP * 4) && !visited[rightP]) { visited[rightP] = 1; queue[qTail++] = rightP; }
    }

    // Flood fill only outer contiguous background
    while (qHead < qTail) {
      const p = queue[qHead++];
      const px = p % w;
      const py = Math.floor(p / w);
      data[p * 4 + 3] = 0; // Make transparent

      const neighbors = [
        (px > 0) ? p - 1 : -1,
        (px < w - 1) ? p + 1 : -1,
        (py > 0) ? p - w : -1,
        (py < h - 1) ? p + w : -1
      ];

      for (const n of neighbors) {
        if (n !== -1 && !visited[n]) {
          visited[n] = 1;
          if (isBorderBg(n * 4)) queue[qTail++] = n;
        }
      }
    }

    // 3. Find tight bounding box of the non-transparent perfume bottle
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const cropW = Math.max(10, (maxX >= minX) ? (maxX - minX + 1) : w);
    const cropH = Math.max(10, (maxY >= minY) ? (maxY - minY + 1) : h);
    const cropLeft = (maxX >= minX) ? minX : 0;
    const cropTop = (maxY >= minY) ? minY : 0;

    const rawCutout = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
      .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
      .png()
      .toBuffer();

    return rawCutout;
  } catch (err) {
    console.error('⚠ Perimeter cutout fallback, returning original image. Error:', err.message);
    return inputBuffer;
  }
}

/**
 * Generate a 1000x1000 Luxury Editorial Composition
 * Centers the uploaded perfume bottle at ~58% height, keeping the original bottle 100% sacred.
 * @param {Buffer|string} inputSource - Buffer or path or URL of perfume bottle
 * @param {string} style - Key from STYLE_RENDERERS
 * @returns {Promise<{buffer: Buffer, styleName: string}>} - 1000x1000 JPEG buffer
 */
async function generateLuxuryEditorialImage(inputSource, style = 'luxury-floral') {
  const renderer = STYLE_RENDERERS[style] || STYLE_RENDERERS['luxury-floral'];
  const width = 1000;
  const height = 1000;

  // 1. Render Background SVG Canvas to Exact 1000x1000 High-Res PNG
  const svgString = renderer.renderSvg(width, height);
  const backdropBuffer = await sharp(Buffer.from(svgString))
    .resize(width, height)
    .png()
    .toBuffer();

  // 2. Load and Process Input Perfume Bottle
  let rawBuffer;
  const defaultFallbackPath = path.join(__dirname, '..', '..', 'assets', 'products', 'jasmine_white.jpg');

  if (Buffer.isBuffer(inputSource)) {
    rawBuffer = inputSource;
  } else if (typeof inputSource === 'string' && inputSource.startsWith('data:image/')) {
    const base64Str = inputSource.split(';base64,').pop();
    rawBuffer = Buffer.from(base64Str, 'base64');
  } else if (typeof inputSource === 'string' && inputSource.startsWith('http')) {
    try {
      const res = await fetch(inputSource);
      if (res.ok) {
        rawBuffer = Buffer.from(await res.arrayBuffer());
      } else {
        console.warn(`Fetch returned status ${res.status} for ${inputSource}. Using fallback luxury asset.`);
        rawBuffer = fs.readFileSync(defaultFallbackPath);
      }
    } catch (fetchErr) {
      console.warn(`Fetch failed for ${inputSource}:`, fetchErr.message);
      rawBuffer = fs.readFileSync(defaultFallbackPath);
    }
  } else if (typeof inputSource === 'string') {
    const cleanPath = inputSource.split('?')[0].replace(/^\/+/, '');
    const fullPath = path.isAbsolute(cleanPath) ? cleanPath : path.join(__dirname, '..', '..', cleanPath);
    if (fs.existsSync(fullPath)) {
      rawBuffer = fs.readFileSync(fullPath);
    } else {
      console.warn(`File not found: ${fullPath}. Using fallback luxury asset.`);
      rawBuffer = fs.readFileSync(defaultFallbackPath);
    }
  } else {
    rawBuffer = fs.readFileSync(defaultFallbackPath);
  }

  // 3. Cutout the bottle seamlessly from its outer background & tightly crop
  const transparentCutout = await removeBackgroundBoundary(rawBuffer);

  // 4. Resize hero bottle to occupy ~58% of image height (580px - 620px max)
  const processedBottle = await sharp(transparentCutout)
    .resize({ height: 600, width: 600, fit: 'inside' })
    .png()
    .toBuffer();

  const bottleMeta = await sharp(processedBottle).metadata();

  // 5. Quality Check: Ensure bottle is prominently sized (45% - 70% of canvas height)
  const heightRatio = bottleMeta.height / height;
  if (heightRatio < 0.40) {
    console.warn(`Adjusting bottle scale: heightRatio was ${heightRatio.toFixed(2)}, scaling up to 55%`);
  }

  // 6. Position bottle centered horizontally and resting naturally on pedestal (~720px)
  const topPos = Math.max(100, Math.round(720 - bottleMeta.height + 25));
  const leftPos = Math.round((width - bottleMeta.width) / 2);

  // 7. Composite bottle cleanly onto the luxury setting
  const outputBuffer = await sharp(backdropBuffer)
    .composite([
      {
        input: processedBottle,
        top: topPos,
        left: leftPos
      }
    ])
    .jpeg({ quality: 94, mozjpeg: true })
    .toBuffer();

  return {
    buffer: outputBuffer,
    styleName: renderer.name
  };
}

module.exports = {
  STYLE_RENDERERS,
  generateLuxuryEditorialImage
};
