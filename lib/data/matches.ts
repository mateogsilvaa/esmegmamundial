import { getTeamById } from './teams';
import type { Match } from '@/lib/types';

const g = (
  id: string,
  group: string,
  home: string,
  away: string,
  date: string,
  venue: string,
  matchday: number,
): Match => ({
  id,
  phase: 'group',
  group,
  homeTeam: getTeamById(home),
  awayTeam: getTeamById(away),
  homeScore: null,
  awayScore: null,
  status: 'scheduled',
  scheduledAt: date,
  venue,
  matchday,
});

export const GROUP_MATCHES: Match[] = [
  // ── Grupo A ──────────────────────────────────────────────────────────────
  g('A1','A','mex','cze','2026-06-11T20:00:00Z','Estadio Azteca, Ciudad de México', 1),
  g('A2','A','rsa','kor','2026-06-12T00:00:00Z','Estadio BBVA, Monterrey',          1),
  g('A3','A','mex','rsa','2026-06-17T23:00:00Z','Estadio Akron, Guadalajara',       2),
  g('A4','A','kor','cze','2026-06-18T20:00:00Z','Estadio BBVA, Monterrey',          2),
  g('A5','A','mex','kor','2026-06-23T21:00:00Z','Estadio Azteca, Ciudad de México', 3),
  g('A6','A','rsa','cze','2026-06-23T21:00:00Z','Estadio Akron, Guadalajara',       3),

  // ── Grupo B ──────────────────────────────────────────────────────────────
  g('B1','B','can','sui','2026-06-12T23:00:00Z','BMO Field, Toronto',              1),
  g('B2','B','bih','qat','2026-06-13T02:00:00Z','BC Place, Vancouver',             1),
  g('B3','B','can','bih','2026-06-18T23:00:00Z','BMO Field, Toronto',              2),
  g('B4','B','qat','sui','2026-06-19T02:00:00Z','Lumen Field, Seattle',            2),
  g('B5','B','can','qat','2026-06-24T21:00:00Z','BC Place, Vancouver',             3),
  g('B6','B','bih','sui','2026-06-24T21:00:00Z','BMO Field, Toronto',              3),

  // ── Grupo C ──────────────────────────────────────────────────────────────
  g('C1','C','bra','sco','2026-06-13T20:00:00Z','MetLife Stadium, Nueva York',     1),
  g('C2','C','mar','hai','2026-06-14T00:00:00Z','Hard Rock Stadium, Miami',        1),
  g('C3','C','bra','mar','2026-06-19T23:00:00Z','MetLife Stadium, Nueva York',     2),
  g('C4','C','hai','sco','2026-06-20T02:00:00Z','Gillette Stadium, Boston',        2),
  g('C5','C','bra','hai','2026-06-25T21:00:00Z','Hard Rock Stadium, Miami',        3),
  g('C6','C','mar','sco','2026-06-25T21:00:00Z','MetLife Stadium, Nueva York',     3),

  // ── Grupo D ──────────────────────────────────────────────────────────────
  g('D1','D','usa','tur','2026-06-14T20:00:00Z','SoFi Stadium, Los Ángeles',       1),
  g('D2','D','par','aus','2026-06-15T00:00:00Z','AT&T Stadium, Dallas',            1),
  g('D3','D','usa','par','2026-06-20T23:00:00Z','SoFi Stadium, Los Ángeles',       2),
  g('D4','D','aus','tur','2026-06-21T02:00:00Z','NRG Stadium, Houston',            2),
  g('D5','D','usa','aus','2026-06-26T21:00:00Z','AT&T Stadium, Dallas',            3),
  g('D6','D','par','tur','2026-06-26T21:00:00Z','SoFi Stadium, Los Ángeles',       3),

  // ── Grupo E ──────────────────────────────────────────────────────────────
  g('E1','E','ger','ecu','2026-06-15T20:00:00Z','Mercedes-Benz Stadium, Atlanta',  1),
  g('E2','E','cuw','civ','2026-06-16T00:00:00Z','NRG Stadium, Houston',            1),
  g('E3','E','ger','cuw','2026-06-21T23:00:00Z','Mercedes-Benz Stadium, Atlanta',  2),
  g('E4','E','civ','ecu','2026-06-22T02:00:00Z','Arrowhead Stadium, Kansas City',  2),
  g('E5','E','ger','civ','2026-06-27T21:00:00Z','NRG Stadium, Houston',            3),
  g('E6','E','cuw','ecu','2026-06-27T21:00:00Z','Mercedes-Benz Stadium, Atlanta',  3),

  // ── Grupo F ──────────────────────────────────────────────────────────────
  g('F1','F','ned','tun','2026-06-15T23:00:00Z','Levi\'s Stadium, San Francisco',  1),
  g('F2','F','jpn','swe','2026-06-16T02:00:00Z','Lumen Field, Seattle',            1),
  g('F3','F','ned','jpn','2026-06-21T20:00:00Z','Levi\'s Stadium, San Francisco',  2),
  g('F4','F','swe','tun','2026-06-22T20:00:00Z','Lumen Field, Seattle',            2),
  g('F5','F','ned','swe','2026-06-27T21:00:00Z','Levi\'s Stadium, San Francisco',  3),
  g('F6','F','jpn','tun','2026-06-27T21:00:00Z','Lumen Field, Seattle',            3),

  // ── Grupo G ──────────────────────────────────────────────────────────────
  g('G1','G','bel','nzl','2026-06-16T20:00:00Z','Gillette Stadium, Boston',        1),
  g('G2','G','egy','irn','2026-06-17T00:00:00Z','Lincoln Financial, Filadelfia',   1),
  g('G3','G','bel','egy','2026-06-22T23:00:00Z','Gillette Stadium, Boston',        2),
  g('G4','G','irn','nzl','2026-06-23T02:00:00Z','Lincoln Financial, Filadelfia',   2),
  g('G5','G','bel','irn','2026-06-28T21:00:00Z','Gillette Stadium, Boston',        3),
  g('G6','G','egy','nzl','2026-06-28T21:00:00Z','Lincoln Financial, Filadelfia',   3),

  // ── Grupo H ──────────────────────────────────────────────────────────────
  g('H1','H','esp','uru','2026-06-17T02:00:00Z','Hard Rock Stadium, Miami',        1),
  g('H2','H','cpv','ksa','2026-06-17T20:00:00Z','Arrowhead Stadium, Kansas City',  1),
  g('H3','H','esp','cpv','2026-06-23T23:00:00Z','Hard Rock Stadium, Miami',        2),
  g('H4','H','ksa','uru','2026-06-24T02:00:00Z','Arrowhead Stadium, Kansas City',  2),
  g('H5','H','esp','ksa','2026-06-28T21:00:00Z','Hard Rock Stadium, Miami',        3),
  g('H6','H','cpv','uru','2026-06-28T21:00:00Z','Arrowhead Stadium, Kansas City',  3),

  // ── Grupo I ──────────────────────────────────────────────────────────────
  g('I1','I','fra','nor','2026-06-18T02:00:00Z','MetLife Stadium, Nueva York',     1),
  g('I2','I','sen','irq','2026-06-18T20:00:00Z','SoFi Stadium, Los Ángeles',       1),
  g('I3','I','fra','sen','2026-06-24T02:00:00Z','MetLife Stadium, Nueva York',     2),
  g('I4','I','irq','nor','2026-06-23T20:00:00Z','SoFi Stadium, Los Ángeles',       2),
  g('I5','I','fra','irq','2026-06-29T21:00:00Z','MetLife Stadium, Nueva York',     3),
  g('I6','I','sen','nor','2026-06-29T21:00:00Z','SoFi Stadium, Los Ángeles',       3),

  // ── Grupo J ──────────────────────────────────────────────────────────────
  g('J1','J','arg','jor','2026-06-18T23:00:00Z','Estadio Azteca, Ciudad de México',1),
  g('J2','J','alg','aut','2026-06-19T02:00:00Z','Estadio BBVA, Monterrey',         1),
  g('J3','J','arg','alg','2026-06-24T23:00:00Z','Estadio Akron, Guadalajara',      2),
  g('J4','J','aut','jor','2026-06-25T02:00:00Z','Estadio Azteca, Ciudad de México',2),
  g('J5','J','arg','aut','2026-06-29T21:00:00Z','Estadio BBVA, Monterrey',         3),
  g('J6','J','alg','jor','2026-06-29T21:00:00Z','Estadio Akron, Guadalajara',      3),

  // ── Grupo K ──────────────────────────────────────────────────────────────
  g('K1','K','por','col','2026-06-19T20:00:00Z','AT&T Stadium, Dallas',            1),
  g('K2','K','cod','uzb','2026-06-19T23:00:00Z','NRG Stadium, Houston',            1),
  g('K3','K','por','cod','2026-06-25T23:00:00Z','AT&T Stadium, Dallas',            2),
  g('K4','K','uzb','col','2026-06-25T20:00:00Z','NRG Stadium, Houston',            2),
  g('K5','K','por','uzb','2026-06-30T21:00:00Z','AT&T Stadium, Dallas',            3),
  g('K6','K','cod','col','2026-06-30T21:00:00Z','NRG Stadium, Houston',            3),

  // ── Grupo L ──────────────────────────────────────────────────────────────
  g('L1','L','eng','pan','2026-06-20T20:00:00Z','BC Place, Vancouver',             1),
  g('L2','L','cro','gha','2026-06-20T23:00:00Z','BMO Field, Toronto',              1),
  g('L3','L','eng','cro','2026-06-26T23:00:00Z','BC Place, Vancouver',             2),
  g('L4','L','gha','pan','2026-06-26T02:00:00Z','Lumen Field, Seattle',            2),
  g('L5','L','eng','gha','2026-07-01T21:00:00Z','BC Place, Vancouver',             3),
  g('L6','L','cro','pan','2026-07-01T21:00:00Z','BMO Field, Toronto',              3),
];

export const getMatchesByGroup = (group: string): Match[] =>
  GROUP_MATCHES.filter(m => m.group === group.toUpperCase());

export const getMatchById = (id: string): Match | null =>
  GROUP_MATCHES.find(m => m.id === id) ?? null;
