/**
 * Fixture oficial del Mundial 2026 — 72 partidos de grupo.
 *
 * Fuente: FIFA / Sky Sports oficial
 * Horas en UTC (BST - 1h). Matchdays simultáneos en MD3.
 *
 * IDs de match: X1-X6 donde X = letra de grupo, n = orden cronológico
 *   1,2 = Jornada 1 | 3,4 = Jornada 2 | 5,6 = Jornada 3 (simultáneos)
 */

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

  // ── Grupo A: MEX RSA KOR CZE ─────────────────────────────────────────────
  // Sedes: Azteca (MXC), Akron (GDL), BBVA (MTY), Mercedes-Benz (ATL)
  g('A1','A','mex','rsa','2026-06-11T19:00:00Z','Estadio Azteca, Ciudad de México',    1),
  g('A2','A','kor','cze','2026-06-12T02:00:00Z','Estadio Akron, Guadalajara',          1),
  g('A3','A','cze','rsa','2026-06-18T16:00:00Z','Mercedes-Benz Stadium, Atlanta',      2),
  g('A4','A','mex','kor','2026-06-19T01:00:00Z','Estadio Akron, Guadalajara',          2),
  g('A5','A','rsa','kor','2026-06-25T01:00:00Z','Estadio BBVA, Monterrey',             3),
  g('A6','A','cze','mex','2026-06-25T01:00:00Z','Estadio Azteca, Ciudad de México',    3),

  // ── Grupo B: CAN BIH QAT SUI ─────────────────────────────────────────────
  // Sedes: BMO (TOR), BC Place (VAN), Levi's (SCA), SoFi (LAX), Lumen (SEA)
  g('B1','B','can','bih','2026-06-12T19:00:00Z','BMO Field, Toronto',                  1),
  g('B2','B','qat','sui','2026-06-13T19:00:00Z','Levi\'s Stadium, Santa Clara',        1),
  g('B3','B','sui','bih','2026-06-18T19:00:00Z','SoFi Stadium, Los Ángeles',           2),
  g('B4','B','can','qat','2026-06-18T22:00:00Z','BC Place, Vancouver',                 2),
  g('B5','B','sui','can','2026-06-24T19:00:00Z','BC Place, Vancouver',                 3),
  g('B6','B','bih','qat','2026-06-24T19:00:00Z','Lumen Field, Seattle',                3),

  // ── Grupo C: BRA MAR HAI SCO ─────────────────────────────────────────────
  // Sedes: MetLife (NYC), Gillette (BOS), Hard Rock (MIA), Lincoln Financial (PHI)
  g('C1','C','bra','mar','2026-06-13T22:00:00Z','MetLife Stadium, Nueva York',         1),
  g('C2','C','hai','sco','2026-06-14T01:00:00Z','Gillette Stadium, Boston',            1),
  g('C3','C','sco','mar','2026-06-19T22:00:00Z','Gillette Stadium, Boston',            2),
  g('C4','C','bra','hai','2026-06-20T00:30:00Z','Lincoln Financial Field, Filadelfia', 2),
  g('C5','C','mar','hai','2026-06-24T22:00:00Z','Mercedes-Benz Stadium, Atlanta',      3),
  g('C6','C','sco','bra','2026-06-24T22:00:00Z','Hard Rock Stadium, Miami',            3),

  // ── Grupo D: USA PAR AUS TUR ─────────────────────────────────────────────
  // Sedes: SoFi (LAX), BC Place (VAN), Lumen (SEA), Levi's (SCA)
  g('D1','D','usa','par','2026-06-13T01:00:00Z','SoFi Stadium, Los Ángeles',           1),
  g('D2','D','aus','tur','2026-06-14T04:00:00Z','BC Place, Vancouver',                 1),
  g('D3','D','usa','aus','2026-06-19T19:00:00Z','Lumen Field, Seattle',                2),
  g('D4','D','tur','par','2026-06-20T03:00:00Z','Levi\'s Stadium, Santa Clara',        2),
  g('D5','D','tur','usa','2026-06-26T02:00:00Z','SoFi Stadium, Los Ángeles',           3),
  g('D6','D','par','aus','2026-06-26T02:00:00Z','Levi\'s Stadium, Santa Clara',        3),

  // ── Grupo E: GER CUW CIV ECU ─────────────────────────────────────────────
  // Sedes: NRG (HOU), Lincoln Financial (PHI), BMO (TOR), Arrowhead (KC), MetLife (NYC)
  g('E1','E','ger','cuw','2026-06-14T17:00:00Z','NRG Stadium, Houston',                1),
  g('E2','E','civ','ecu','2026-06-14T23:00:00Z','Lincoln Financial Field, Filadelfia', 1),
  g('E3','E','ger','civ','2026-06-20T20:00:00Z','BMO Field, Toronto',                  2),
  g('E4','E','ecu','cuw','2026-06-21T00:00:00Z','Arrowhead Stadium, Kansas City',      2),
  g('E5','E','cuw','civ','2026-06-25T20:00:00Z','Lincoln Financial Field, Filadelfia', 3),
  g('E6','E','ecu','ger','2026-06-25T20:00:00Z','MetLife Stadium, Nueva York',         3),

  // ── Grupo F: NED JPN SWE TUN ─────────────────────────────────────────────
  // Sedes: AT&T (ARL), BBVA (MTY), NRG (HOU), Arrowhead (KC)
  g('F1','F','ned','jpn','2026-06-14T20:00:00Z','AT&T Stadium, Arlington',             1),
  g('F2','F','swe','tun','2026-06-15T02:00:00Z','Estadio BBVA, Monterrey',             1),
  g('F3','F','ned','swe','2026-06-20T17:00:00Z','NRG Stadium, Houston',                2),
  g('F4','F','tun','jpn','2026-06-21T04:00:00Z','Estadio BBVA, Monterrey',             2),
  g('F5','F','tun','ned','2026-06-25T23:00:00Z','Arrowhead Stadium, Kansas City',      3),
  g('F6','F','jpn','swe','2026-06-25T23:00:00Z','AT&T Stadium, Arlington',             3),

  // ── Grupo G: BEL EGY IRN NZL ─────────────────────────────────────────────
  // Sedes: Lumen (SEA), SoFi (LAX), BC Place (VAN)
  g('G1','G','bel','egy','2026-06-15T19:00:00Z','Lumen Field, Seattle',                1),
  g('G2','G','irn','nzl','2026-06-16T01:00:00Z','SoFi Stadium, Los Ángeles',           1),
  g('G3','G','nzl','egy','2026-06-21T01:00:00Z','BC Place, Vancouver',                 2),
  g('G4','G','bel','irn','2026-06-21T19:00:00Z','SoFi Stadium, Los Ángeles',           2),
  g('G5','G','nzl','bel','2026-06-27T03:00:00Z','BC Place, Vancouver',                 3),
  g('G6','G','egy','irn','2026-06-27T03:00:00Z','Lumen Field, Seattle',                3),

  // ── Grupo H: ESP CPV KSA URU ─────────────────────────────────────────────
  // Sedes: Mercedes-Benz (ATL), Hard Rock (MIA), NRG (HOU), Akron (GDL)
  g('H1','H','esp','cpv','2026-06-15T16:00:00Z','Mercedes-Benz Stadium, Atlanta',      1),
  g('H2','H','ksa','uru','2026-06-15T22:00:00Z','Hard Rock Stadium, Miami',            1),
  g('H3','H','esp','ksa','2026-06-21T16:00:00Z','Mercedes-Benz Stadium, Atlanta',      2),
  g('H4','H','uru','cpv','2026-06-21T22:00:00Z','Hard Rock Stadium, Miami',            2),
  g('H5','H','cpv','ksa','2026-06-27T00:00:00Z','NRG Stadium, Houston',                3),
  g('H6','H','uru','esp','2026-06-27T00:00:00Z','Estadio Akron, Guadalajara',          3),

  // ── Grupo I: FRA SEN IRQ NOR ─────────────────────────────────────────────
  // Sedes: MetLife (NYC), Gillette (BOS), Lincoln Financial (PHI), BMO (TOR)
  g('I1','I','fra','sen','2026-06-16T19:00:00Z','MetLife Stadium, Nueva York',         1),
  g('I2','I','irq','nor','2026-06-16T22:00:00Z','Gillette Stadium, Boston',            1),
  g('I3','I','fra','irq','2026-06-22T21:00:00Z','Lincoln Financial Field, Filadelfia', 2),
  g('I4','I','nor','sen','2026-06-23T00:00:00Z','BMO Field, Toronto',                  2),
  g('I5','I','nor','fra','2026-06-26T19:00:00Z','Gillette Stadium, Boston',            3),
  g('I6','I','sen','irq','2026-06-26T19:00:00Z','BMO Field, Toronto',                  3),

  // ── Grupo J: ARG ALG AUT JOR ─────────────────────────────────────────────
  // Sedes: Arrowhead (KC), Levi's (SCA), AT&T (ARL)
  g('J1','J','arg','alg','2026-06-17T01:00:00Z','Arrowhead Stadium, Kansas City',      1),
  g('J2','J','aut','jor','2026-06-17T04:00:00Z','Levi\'s Stadium, Santa Clara',        1),
  g('J3','J','arg','aut','2026-06-22T17:00:00Z','AT&T Stadium, Arlington',             2),
  g('J4','J','jor','alg','2026-06-23T03:00:00Z','Levi\'s Stadium, Santa Clara',        2),
  g('J5','J','alg','aut','2026-06-28T02:00:00Z','Arrowhead Stadium, Kansas City',      3),
  g('J6','J','jor','arg','2026-06-28T02:00:00Z','AT&T Stadium, Arlington',             3),

  // ── Grupo K: POR COD UZB COL ─────────────────────────────────────────────
  // Sedes: NRG (HOU), Azteca (MXC), Akron (GDL), Hard Rock (MIA), Mercedes-Benz (ATL)
  g('K1','K','por','cod','2026-06-17T17:00:00Z','NRG Stadium, Houston',                1),
  g('K2','K','uzb','col','2026-06-18T02:00:00Z','Estadio Azteca, Ciudad de México',    1),
  g('K3','K','por','uzb','2026-06-23T17:00:00Z','NRG Stadium, Houston',                2),
  g('K4','K','col','cod','2026-06-24T02:00:00Z','Estadio Akron, Guadalajara',          2),
  g('K5','K','col','por','2026-06-27T23:30:00Z','Hard Rock Stadium, Miami',            3),
  g('K6','K','cod','uzb','2026-06-27T23:30:00Z','Mercedes-Benz Stadium, Atlanta',      3),

  // ── Grupo L: ENG CRO GHA PAN ─────────────────────────────────────────────
  // Sedes: AT&T (ARL), BMO (TOR), Gillette (BOS), MetLife (NYC), Lincoln Financial (PHI)
  g('L1','L','eng','cro','2026-06-17T20:00:00Z','AT&T Stadium, Arlington',             1),
  g('L2','L','gha','pan','2026-06-17T23:00:00Z','BMO Field, Toronto',                  1),
  g('L3','L','eng','gha','2026-06-23T20:00:00Z','Gillette Stadium, Boston',            2),
  g('L4','L','pan','cro','2026-06-23T23:00:00Z','Gillette Stadium, Boston',            2),
  g('L5','L','pan','eng','2026-06-27T21:00:00Z','MetLife Stadium, Nueva York',         3),
  g('L6','L','cro','gha','2026-06-27T21:00:00Z','Lincoln Financial Field, Filadelfia', 3),
];

export const getMatchesByGroup = (group: string): Match[] =>
  GROUP_MATCHES.filter(m => m.group === group.toUpperCase());

export const getMatchById = (id: string): Match | null =>
  GROUP_MATCHES.find(m => m.id === id) ?? null;
