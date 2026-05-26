import type { Team } from '@/lib/types';

export const TEAMS: Team[] = [
  // ── Grupo A ──────────────────────────────────────────────────────────────
  { id: 'mex', name: 'México',               shortName: 'MEX', flag: '🇲🇽', code: 'mx',     group: 'A', confederation: 'CONCACAF', fifaRank: 16 },
  { id: 'rsa', name: 'Sudáfrica',            shortName: 'RSA', flag: '🇿🇦', code: 'za',     group: 'A', confederation: 'CAF',      fifaRank: 60 },
  { id: 'kor', name: 'Corea del Sur',        shortName: 'KOR', flag: '🇰🇷', code: 'kr',     group: 'A', confederation: 'AFC',      fifaRank: 22 },
  { id: 'cze', name: 'Chequia',              shortName: 'CZE', flag: '🇨🇿', code: 'cz',     group: 'A', confederation: 'UEFA',     fifaRank: 37 },

  // ── Grupo B ──────────────────────────────────────────────────────────────
  { id: 'can', name: 'Canadá',               shortName: 'CAN', flag: '🇨🇦', code: 'ca',     group: 'B', confederation: 'CONCACAF', fifaRank: 43 },
  { id: 'bih', name: 'Bosnia y Herzegovina', shortName: 'BIH', flag: '🇧🇦', code: 'ba',     group: 'B', confederation: 'UEFA',     fifaRank: 62 },
  { id: 'qat', name: 'Catar',                shortName: 'QAT', flag: '🇶🇦', code: 'qa',     group: 'B', confederation: 'AFC',      fifaRank: 58 },
  { id: 'sui', name: 'Suiza',                shortName: 'SUI', flag: '🇨🇭', code: 'ch',     group: 'B', confederation: 'UEFA',     fifaRank: 19 },

  // ── Grupo C ──────────────────────────────────────────────────────────────
  { id: 'bra', name: 'Brasil',               shortName: 'BRA', flag: '🇧🇷', code: 'br',     group: 'C', confederation: 'CONMEBOL', fifaRank: 5 },
  { id: 'mar', name: 'Marruecos',            shortName: 'MAR', flag: '🇲🇦', code: 'ma',     group: 'C', confederation: 'CAF',      fifaRank: 14 },
  { id: 'hai', name: 'Haití',                shortName: 'HAI', flag: '🇭🇹', code: 'ht',     group: 'C', confederation: 'CONCACAF', fifaRank: 83 },
  { id: 'sco', name: 'Escocia',              shortName: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', code: 'gb-sct', group: 'C', confederation: 'UEFA',     fifaRank: 39 },

  // ── Grupo D ──────────────────────────────────────────────────────────────
  { id: 'usa', name: 'Estados Unidos',       shortName: 'USA', flag: '🇺🇸', code: 'us',     group: 'D', confederation: 'CONCACAF', fifaRank: 13 },
  { id: 'par', name: 'Paraguay',             shortName: 'PAR', flag: '🇵🇾', code: 'py',     group: 'D', confederation: 'CONMEBOL', fifaRank: 55 },
  { id: 'aus', name: 'Australia',            shortName: 'AUS', flag: '🇦🇺', code: 'au',     group: 'D', confederation: 'AFC',      fifaRank: 23 },
  { id: 'tur', name: 'Turquía',              shortName: 'TUR', flag: '🇹🇷', code: 'tr',     group: 'D', confederation: 'UEFA',     fifaRank: 31 },

  // ── Grupo E ──────────────────────────────────────────────────────────────
  { id: 'ger', name: 'Alemania',             shortName: 'GER', flag: '🇩🇪', code: 'de',     group: 'E', confederation: 'UEFA',     fifaRank: 15 },
  { id: 'cuw', name: 'Curaçao',              shortName: 'CUW', flag: '🇨🇼', code: 'cw',     group: 'E', confederation: 'CONCACAF', fifaRank: 79 },
  { id: 'civ', name: 'Costa de Marfil',      shortName: 'CIV', flag: '🇨🇮', code: 'ci',     group: 'E', confederation: 'CAF',      fifaRank: 49 },
  { id: 'ecu', name: 'Ecuador',              shortName: 'ECU', flag: '🇪🇨', code: 'ec',     group: 'E', confederation: 'CONMEBOL', fifaRank: 46 },

  // ── Grupo F ──────────────────────────────────────────────────────────────
  { id: 'ned', name: 'Países Bajos',         shortName: 'NED', flag: '🇳🇱', code: 'nl',     group: 'F', confederation: 'UEFA',     fifaRank: 7 },
  { id: 'jpn', name: 'Japón',                shortName: 'JPN', flag: '🇯🇵', code: 'jp',     group: 'F', confederation: 'AFC',      fifaRank: 17 },
  { id: 'swe', name: 'Suecia',               shortName: 'SWE', flag: '🇸🇪', code: 'se',     group: 'F', confederation: 'UEFA',     fifaRank: 26 },
  { id: 'tun', name: 'Túnez',                shortName: 'TUN', flag: '🇹🇳', code: 'tn',     group: 'F', confederation: 'CAF',      fifaRank: 30 },

  // ── Grupo G ──────────────────────────────────────────────────────────────
  { id: 'bel', name: 'Bélgica',              shortName: 'BEL', flag: '🇧🇪', code: 'be',     group: 'G', confederation: 'UEFA',     fifaRank: 3 },
  { id: 'egy', name: 'Egipto',               shortName: 'EGY', flag: '🇪🇬', code: 'eg',     group: 'G', confederation: 'CAF',      fifaRank: 35 },
  { id: 'irn', name: 'Irán',                 shortName: 'IRN', flag: '🇮🇷', code: 'ir',     group: 'G', confederation: 'AFC',      fifaRank: 22 },
  { id: 'nzl', name: 'Nueva Zelanda',        shortName: 'NZL', flag: '🇳🇿', code: 'nz',     group: 'G', confederation: 'OFC',      fifaRank: 98 },

  // ── Grupo H ──────────────────────────────────────────────────────────────
  { id: 'esp', name: 'España',               shortName: 'ESP', flag: '🇪🇸', code: 'es',     group: 'H', confederation: 'UEFA',     fifaRank: 2 },
  { id: 'cpv', name: 'Cabo Verde',           shortName: 'CPV', flag: '🇨🇻', code: 'cv',     group: 'H', confederation: 'CAF',      fifaRank: 72 },
  { id: 'ksa', name: 'Arabia Saudí',         shortName: 'KSA', flag: '🇸🇦', code: 'sa',     group: 'H', confederation: 'AFC',      fifaRank: 56 },
  { id: 'uru', name: 'Uruguay',              shortName: 'URU', flag: '🇺🇾', code: 'uy',     group: 'H', confederation: 'CONMEBOL', fifaRank: 18 },

  // ── Grupo I ──────────────────────────────────────────────────────────────
  { id: 'fra', name: 'Francia',              shortName: 'FRA', flag: '🇫🇷', code: 'fr',     group: 'I', confederation: 'UEFA',     fifaRank: 2 },
  { id: 'sen', name: 'Senegal',              shortName: 'SEN', flag: '🇸🇳', code: 'sn',     group: 'I', confederation: 'CAF',      fifaRank: 20 },
  { id: 'irq', name: 'Irak',                 shortName: 'IRQ', flag: '🇮🇶', code: 'iq',     group: 'I', confederation: 'AFC',      fifaRank: 62 },
  { id: 'nor', name: 'Noruega',              shortName: 'NOR', flag: '🇳🇴', code: 'no',     group: 'I', confederation: 'UEFA',     fifaRank: 28 },

  // ── Grupo J ──────────────────────────────────────────────────────────────
  { id: 'arg', name: 'Argentina',            shortName: 'ARG', flag: '🇦🇷', code: 'ar',     group: 'J', confederation: 'CONMEBOL', fifaRank: 1 },
  { id: 'alg', name: 'Argelia',              shortName: 'ALG', flag: '🇩🇿', code: 'dz',     group: 'J', confederation: 'CAF',      fifaRank: 52 },
  { id: 'aut', name: 'Austria',              shortName: 'AUT', flag: '🇦🇹', code: 'at',     group: 'J', confederation: 'UEFA',     fifaRank: 25 },
  { id: 'jor', name: 'Jordania',             shortName: 'JOR', flag: '🇯🇴', code: 'jo',     group: 'J', confederation: 'AFC',      fifaRank: 68 },

  // ── Grupo K ──────────────────────────────────────────────────────────────
  { id: 'por', name: 'Portugal',             shortName: 'POR', flag: '🇵🇹', code: 'pt',     group: 'K', confederation: 'UEFA',     fifaRank: 6 },
  { id: 'cod', name: 'R.D. Congo',           shortName: 'COD', flag: '🇨🇩', code: 'cd',     group: 'K', confederation: 'CAF',      fifaRank: 47 },
  { id: 'uzb', name: 'Uzbekistán',           shortName: 'UZB', flag: '🇺🇿', code: 'uz',     group: 'K', confederation: 'AFC',      fifaRank: 66 },
  { id: 'col', name: 'Colombia',             shortName: 'COL', flag: '🇨🇴', code: 'co',     group: 'K', confederation: 'CONMEBOL', fifaRank: 9 },

  // ── Grupo L ──────────────────────────────────────────────────────────────
  { id: 'eng', name: 'Inglaterra',           shortName: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'gb-eng', group: 'L', confederation: 'UEFA',     fifaRank: 4 },
  { id: 'cro', name: 'Croacia',              shortName: 'CRO', flag: '🇭🇷', code: 'hr',     group: 'L', confederation: 'UEFA',     fifaRank: 10 },
  { id: 'gha', name: 'Ghana',                shortName: 'GHA', flag: '🇬🇭', code: 'gh',     group: 'L', confederation: 'CAF',      fifaRank: 65 },
  { id: 'pan', name: 'Panamá',               shortName: 'PAN', flag: '🇵🇦', code: 'pa',     group: 'L', confederation: 'CONCACAF', fifaRank: 54 },
];

export const getTeamById = (id: string): Team | null =>
  TEAMS.find(t => t.id === id) ?? null;

export const getTeamsByGroup = (group: string): Team[] =>
  TEAMS.filter(t => t.group === group.toUpperCase());

export const GROUP_IDS = ['A','B','C','D','E','F','G','H','I','J','K','L'] as const;
export type GroupId = typeof GROUP_IDS[number];
