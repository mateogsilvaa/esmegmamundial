-- ============================================================
--  MUNDIAL 2026 — Seed: 72 partidos de grupo + 32 eliminatorias
--  Fuente: Fixture oficial FIFA / Sky Sports
--  Horas en UTC (BST - 1h)
--  Ejecutar DESPUÉS de 01_schema.sql
-- ============================================================

-- ─── Partidos de grupo ────────────────────────────────────────────────────────

insert into public.matches
  (id, phase, group_id, home_team_id, away_team_id, scheduled_at, venue, matchday, status)
values

-- Grupo A: MEX RSA KOR CZE
('A1','group','A','mex','rsa','2026-06-11T19:00:00Z','Estadio Azteca, Ciudad de México',       1,'scheduled'),
('A2','group','A','kor','cze','2026-06-12T02:00:00Z','Estadio Akron, Guadalajara',             1,'scheduled'),
('A3','group','A','cze','rsa','2026-06-18T16:00:00Z','Mercedes-Benz Stadium, Atlanta',         2,'scheduled'),
('A4','group','A','mex','kor','2026-06-19T01:00:00Z','Estadio Akron, Guadalajara',             2,'scheduled'),
('A5','group','A','rsa','kor','2026-06-25T01:00:00Z','Estadio BBVA, Monterrey',                3,'scheduled'),
('A6','group','A','cze','mex','2026-06-25T01:00:00Z','Estadio Azteca, Ciudad de México',       3,'scheduled'),

-- Grupo B: CAN BIH QAT SUI
('B1','group','B','can','bih','2026-06-12T19:00:00Z','BMO Field, Toronto',                     1,'scheduled'),
('B2','group','B','qat','sui','2026-06-13T19:00:00Z','Levi''s Stadium, Santa Clara',           1,'scheduled'),
('B3','group','B','sui','bih','2026-06-18T19:00:00Z','SoFi Stadium, Los Ángeles',              2,'scheduled'),
('B4','group','B','can','qat','2026-06-18T22:00:00Z','BC Place, Vancouver',                    2,'scheduled'),
('B5','group','B','sui','can','2026-06-24T19:00:00Z','BC Place, Vancouver',                    3,'scheduled'),
('B6','group','B','bih','qat','2026-06-24T19:00:00Z','Lumen Field, Seattle',                   3,'scheduled'),

-- Grupo C: BRA MAR HAI SCO
('C1','group','C','bra','mar','2026-06-13T22:00:00Z','MetLife Stadium, Nueva York',            1,'scheduled'),
('C2','group','C','hai','sco','2026-06-14T01:00:00Z','Gillette Stadium, Boston',               1,'scheduled'),
('C3','group','C','sco','mar','2026-06-19T22:00:00Z','Gillette Stadium, Boston',               2,'scheduled'),
('C4','group','C','bra','hai','2026-06-20T00:30:00Z','Lincoln Financial Field, Filadelfia',    2,'scheduled'),
('C5','group','C','mar','hai','2026-06-24T22:00:00Z','Mercedes-Benz Stadium, Atlanta',         3,'scheduled'),
('C6','group','C','sco','bra','2026-06-24T22:00:00Z','Hard Rock Stadium, Miami',               3,'scheduled'),

-- Grupo D: USA PAR AUS TUR
('D1','group','D','usa','par','2026-06-13T01:00:00Z','SoFi Stadium, Los Ángeles',              1,'scheduled'),
('D2','group','D','aus','tur','2026-06-14T04:00:00Z','BC Place, Vancouver',                    1,'scheduled'),
('D3','group','D','usa','aus','2026-06-19T19:00:00Z','Lumen Field, Seattle',                   2,'scheduled'),
('D4','group','D','tur','par','2026-06-20T03:00:00Z','Levi''s Stadium, Santa Clara',           2,'scheduled'),
('D5','group','D','tur','usa','2026-06-26T02:00:00Z','SoFi Stadium, Los Ángeles',              3,'scheduled'),
('D6','group','D','par','aus','2026-06-26T02:00:00Z','Levi''s Stadium, Santa Clara',           3,'scheduled'),

-- Grupo E: GER CUW CIV ECU
('E1','group','E','ger','cuw','2026-06-14T17:00:00Z','NRG Stadium, Houston',                   1,'scheduled'),
('E2','group','E','civ','ecu','2026-06-14T23:00:00Z','Lincoln Financial Field, Filadelfia',    1,'scheduled'),
('E3','group','E','ger','civ','2026-06-20T20:00:00Z','BMO Field, Toronto',                     2,'scheduled'),
('E4','group','E','ecu','cuw','2026-06-21T00:00:00Z','Arrowhead Stadium, Kansas City',         2,'scheduled'),
('E5','group','E','cuw','civ','2026-06-25T20:00:00Z','Lincoln Financial Field, Filadelfia',    3,'scheduled'),
('E6','group','E','ecu','ger','2026-06-25T20:00:00Z','MetLife Stadium, Nueva York',            3,'scheduled'),

-- Grupo F: NED JPN SWE TUN
('F1','group','F','ned','jpn','2026-06-14T20:00:00Z','AT&T Stadium, Arlington',                1,'scheduled'),
('F2','group','F','swe','tun','2026-06-15T02:00:00Z','Estadio BBVA, Monterrey',                1,'scheduled'),
('F3','group','F','ned','swe','2026-06-20T17:00:00Z','NRG Stadium, Houston',                   2,'scheduled'),
('F4','group','F','tun','jpn','2026-06-21T04:00:00Z','Estadio BBVA, Monterrey',                2,'scheduled'),
('F5','group','F','tun','ned','2026-06-25T23:00:00Z','Arrowhead Stadium, Kansas City',         3,'scheduled'),
('F6','group','F','jpn','swe','2026-06-25T23:00:00Z','AT&T Stadium, Arlington',                3,'scheduled'),

-- Grupo G: BEL EGY IRN NZL
('G1','group','G','bel','egy','2026-06-15T19:00:00Z','Lumen Field, Seattle',                   1,'scheduled'),
('G2','group','G','irn','nzl','2026-06-16T01:00:00Z','SoFi Stadium, Los Ángeles',              1,'scheduled'),
('G3','group','G','nzl','egy','2026-06-21T01:00:00Z','BC Place, Vancouver',                    2,'scheduled'),
('G4','group','G','bel','irn','2026-06-21T19:00:00Z','SoFi Stadium, Los Ángeles',              2,'scheduled'),
('G5','group','G','nzl','bel','2026-06-27T03:00:00Z','BC Place, Vancouver',                    3,'scheduled'),
('G6','group','G','egy','irn','2026-06-27T03:00:00Z','Lumen Field, Seattle',                   3,'scheduled'),

-- Grupo H: ESP CPV KSA URU
('H1','group','H','esp','cpv','2026-06-15T16:00:00Z','Mercedes-Benz Stadium, Atlanta',         1,'scheduled'),
('H2','group','H','ksa','uru','2026-06-15T22:00:00Z','Hard Rock Stadium, Miami',               1,'scheduled'),
('H3','group','H','esp','ksa','2026-06-21T16:00:00Z','Mercedes-Benz Stadium, Atlanta',         2,'scheduled'),
('H4','group','H','uru','cpv','2026-06-21T22:00:00Z','Hard Rock Stadium, Miami',               2,'scheduled'),
('H5','group','H','cpv','ksa','2026-06-27T00:00:00Z','NRG Stadium, Houston',                   3,'scheduled'),
('H6','group','H','uru','esp','2026-06-27T00:00:00Z','Estadio Akron, Guadalajara',             3,'scheduled'),

-- Grupo I: FRA SEN IRQ NOR
('I1','group','I','fra','sen','2026-06-16T19:00:00Z','MetLife Stadium, Nueva York',            1,'scheduled'),
('I2','group','I','irq','nor','2026-06-16T22:00:00Z','Gillette Stadium, Boston',               1,'scheduled'),
('I3','group','I','fra','irq','2026-06-22T21:00:00Z','Lincoln Financial Field, Filadelfia',    2,'scheduled'),
('I4','group','I','nor','sen','2026-06-23T00:00:00Z','BMO Field, Toronto',                     2,'scheduled'),
('I5','group','I','nor','fra','2026-06-26T19:00:00Z','Gillette Stadium, Boston',               3,'scheduled'),
('I6','group','I','sen','irq','2026-06-26T19:00:00Z','BMO Field, Toronto',                     3,'scheduled'),

-- Grupo J: ARG ALG AUT JOR
('J1','group','J','arg','alg','2026-06-17T01:00:00Z','Arrowhead Stadium, Kansas City',         1,'scheduled'),
('J2','group','J','aut','jor','2026-06-17T04:00:00Z','Levi''s Stadium, Santa Clara',           1,'scheduled'),
('J3','group','J','arg','aut','2026-06-22T17:00:00Z','AT&T Stadium, Arlington',                2,'scheduled'),
('J4','group','J','jor','alg','2026-06-23T03:00:00Z','Levi''s Stadium, Santa Clara',           2,'scheduled'),
('J5','group','J','alg','aut','2026-06-28T02:00:00Z','Arrowhead Stadium, Kansas City',         3,'scheduled'),
('J6','group','J','jor','arg','2026-06-28T02:00:00Z','AT&T Stadium, Arlington',                3,'scheduled'),

-- Grupo K: POR COD UZB COL
('K1','group','K','por','cod','2026-06-17T17:00:00Z','NRG Stadium, Houston',                   1,'scheduled'),
('K2','group','K','uzb','col','2026-06-18T02:00:00Z','Estadio Azteca, Ciudad de México',       1,'scheduled'),
('K3','group','K','por','uzb','2026-06-23T17:00:00Z','NRG Stadium, Houston',                   2,'scheduled'),
('K4','group','K','col','cod','2026-06-24T02:00:00Z','Estadio Akron, Guadalajara',             2,'scheduled'),
('K5','group','K','col','por','2026-06-27T23:30:00Z','Hard Rock Stadium, Miami',               3,'scheduled'),
('K6','group','K','cod','uzb','2026-06-27T23:30:00Z','Mercedes-Benz Stadium, Atlanta',         3,'scheduled'),

-- Grupo L: ENG CRO GHA PAN
('L1','group','L','eng','cro','2026-06-17T20:00:00Z','AT&T Stadium, Arlington',                1,'scheduled'),
('L2','group','L','gha','pan','2026-06-17T23:00:00Z','BMO Field, Toronto',                     1,'scheduled'),
('L3','group','L','eng','gha','2026-06-23T20:00:00Z','Gillette Stadium, Boston',               2,'scheduled'),
('L4','group','L','pan','cro','2026-06-23T23:00:00Z','Gillette Stadium, Boston',               2,'scheduled'),
('L5','group','L','pan','eng','2026-06-27T21:00:00Z','MetLife Stadium, Nueva York',            3,'scheduled'),
('L6','group','L','cro','gha','2026-06-27T21:00:00Z','Lincoln Financial Field, Filadelfia',    3,'scheduled')

on conflict (id) do update set
  phase        = excluded.phase,
  group_id     = excluded.group_id,
  home_team_id = excluded.home_team_id,
  away_team_id = excluded.away_team_id,
  scheduled_at = excluded.scheduled_at,
  venue        = excluded.venue,
  matchday     = excluded.matchday,
  status       = excluded.status;

-- ─── Fase eliminatoria (equipos por determinar) ───────────────────────────────

insert into public.matches
  (id, phase, status, scheduled_at, venue, round_slot)
values

-- Dieciseisavos de final (R32) — fechas UTC oficiales
('P73', 'round_of_32','scheduled','2026-06-28T19:00:00Z','Por determinar',1),
('P74', 'round_of_32','scheduled','2026-06-29T20:30:00Z','Por determinar',2),
('P75', 'round_of_32','scheduled','2026-06-30T01:00:00Z','Por determinar',3),
('P76', 'round_of_32','scheduled','2026-06-29T17:00:00Z','Por determinar',4),
('P77', 'round_of_32','scheduled','2026-06-30T21:00:00Z','Por determinar',5),
('P78', 'round_of_32','scheduled','2026-06-30T17:00:00Z','Por determinar',6),
('P79', 'round_of_32','scheduled','2026-07-01T01:00:00Z','Por determinar',7),
('P80', 'round_of_32','scheduled','2026-07-01T16:00:00Z','Por determinar',8),
('P81', 'round_of_32','scheduled','2026-07-02T00:00:00Z','Por determinar',9),
('P82', 'round_of_32','scheduled','2026-07-01T20:00:00Z','Por determinar',10),
('P83', 'round_of_32','scheduled','2026-07-02T23:00:00Z','Por determinar',11),
('P84', 'round_of_32','scheduled','2026-07-02T19:00:00Z','Por determinar',12),
('P85', 'round_of_32','scheduled','2026-07-03T03:00:00Z','Por determinar',13),
('P86', 'round_of_32','scheduled','2026-07-03T22:00:00Z','Por determinar',14),
('P87', 'round_of_32','scheduled','2026-07-04T01:30:00Z','Por determinar',15),
('P88', 'round_of_32','scheduled','2026-07-03T18:00:00Z','Por determinar',16),

-- Octavos de final (R16)
('P89', 'round_of_16','scheduled','2026-07-04T21:00:00Z','Por determinar',1),
('P90', 'round_of_16','scheduled','2026-07-04T17:00:00Z','Por determinar',2),
('P91', 'round_of_16','scheduled','2026-07-05T20:00:00Z','Por determinar',3),
('P92', 'round_of_16','scheduled','2026-07-06T00:00:00Z','Por determinar',4),
('P93', 'round_of_16','scheduled','2026-07-06T19:00:00Z','Por determinar',5),
('P94', 'round_of_16','scheduled','2026-07-07T00:00:00Z','Por determinar',6),
('P95', 'round_of_16','scheduled','2026-07-07T16:00:00Z','Por determinar',7),
('P96', 'round_of_16','scheduled','2026-07-07T20:00:00Z','Por determinar',8),

-- Cuartos de final
('P97',  'quarterfinal','scheduled','2026-07-09T20:00:00Z','Por determinar',1),
('P98',  'quarterfinal','scheduled','2026-07-10T19:00:00Z','Por determinar',2),
('P99',  'quarterfinal','scheduled','2026-07-11T21:00:00Z','Por determinar',3),
('P100', 'quarterfinal','scheduled','2026-07-12T01:00:00Z','Por determinar',4),

-- Semifinales
('P101','semifinal','scheduled','2026-07-14T19:00:00Z','Por determinar',1),
('P102','semifinal','scheduled','2026-07-15T19:00:00Z','Por determinar',2),

-- Tercer puesto y Final
('P103','third_place','scheduled','2026-07-18T21:00:00Z','Por determinar',1),
('P104','final',      'scheduled','2026-07-19T19:00:00Z','Por determinar',1)

on conflict (id) do update set
  phase      = excluded.phase,
  status     = excluded.status,
  scheduled_at = excluded.scheduled_at,
  round_slot = excluded.round_slot;
