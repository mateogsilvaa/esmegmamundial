-- ============================================================
--  MUNDIAL 2026 — Seed de partidos
--  Ejecutar en: Supabase > SQL Editor  (después de 01_schema.sql)
--  Incluye: 72 partidos de grupos + 32 partidos de la fase eliminatoria
-- ============================================================

-- ─── Partidos de grupo ────────────────────────────────────────────────────────

insert into public.matches
  (id, phase, group_id, home_team_id, away_team_id, status, scheduled_at, venue, matchday)
values

-- Grupo A
('A1','group','A','mex','cze','scheduled','2026-06-11T20:00:00Z','Estadio Azteca, Ciudad de México',1),
('A2','group','A','rsa','kor','scheduled','2026-06-12T00:00:00Z','Estadio BBVA, Monterrey',1),
('A3','group','A','mex','rsa','scheduled','2026-06-17T23:00:00Z','Estadio Akron, Guadalajara',2),
('A4','group','A','kor','cze','scheduled','2026-06-18T20:00:00Z','Estadio BBVA, Monterrey',2),
('A5','group','A','mex','kor','scheduled','2026-06-23T21:00:00Z','Estadio Azteca, Ciudad de México',3),
('A6','group','A','rsa','cze','scheduled','2026-06-23T21:00:00Z','Estadio Akron, Guadalajara',3),

-- Grupo B
('B1','group','B','can','sui','scheduled','2026-06-12T23:00:00Z','BMO Field, Toronto',1),
('B2','group','B','bih','qat','scheduled','2026-06-13T02:00:00Z','BC Place, Vancouver',1),
('B3','group','B','can','bih','scheduled','2026-06-18T23:00:00Z','BMO Field, Toronto',2),
('B4','group','B','qat','sui','scheduled','2026-06-19T02:00:00Z','Lumen Field, Seattle',2),
('B5','group','B','can','qat','scheduled','2026-06-24T21:00:00Z','BC Place, Vancouver',3),
('B6','group','B','bih','sui','scheduled','2026-06-24T21:00:00Z','BMO Field, Toronto',3),

-- Grupo C
('C1','group','C','bra','sco','scheduled','2026-06-13T20:00:00Z','MetLife Stadium, Nueva York',1),
('C2','group','C','mar','hai','scheduled','2026-06-14T00:00:00Z','Hard Rock Stadium, Miami',1),
('C3','group','C','bra','mar','scheduled','2026-06-19T23:00:00Z','MetLife Stadium, Nueva York',2),
('C4','group','C','hai','sco','scheduled','2026-06-20T02:00:00Z','Gillette Stadium, Boston',2),
('C5','group','C','bra','hai','scheduled','2026-06-25T21:00:00Z','Hard Rock Stadium, Miami',3),
('C6','group','C','mar','sco','scheduled','2026-06-25T21:00:00Z','MetLife Stadium, Nueva York',3),

-- Grupo D
('D1','group','D','usa','tur','scheduled','2026-06-14T20:00:00Z','SoFi Stadium, Los Ángeles',1),
('D2','group','D','par','aus','scheduled','2026-06-15T00:00:00Z','AT&T Stadium, Dallas',1),
('D3','group','D','usa','par','scheduled','2026-06-20T23:00:00Z','SoFi Stadium, Los Ángeles',2),
('D4','group','D','aus','tur','scheduled','2026-06-21T02:00:00Z','NRG Stadium, Houston',2),
('D5','group','D','usa','aus','scheduled','2026-06-26T21:00:00Z','AT&T Stadium, Dallas',3),
('D6','group','D','par','tur','scheduled','2026-06-26T21:00:00Z','SoFi Stadium, Los Ángeles',3),

-- Grupo E
('E1','group','E','ger','ecu','scheduled','2026-06-15T20:00:00Z','Mercedes-Benz Stadium, Atlanta',1),
('E2','group','E','cuw','civ','scheduled','2026-06-16T00:00:00Z','NRG Stadium, Houston',1),
('E3','group','E','ger','cuw','scheduled','2026-06-21T23:00:00Z','Mercedes-Benz Stadium, Atlanta',2),
('E4','group','E','civ','ecu','scheduled','2026-06-22T02:00:00Z','Arrowhead Stadium, Kansas City',2),
('E5','group','E','ger','civ','scheduled','2026-06-27T21:00:00Z','NRG Stadium, Houston',3),
('E6','group','E','cuw','ecu','scheduled','2026-06-27T21:00:00Z','Mercedes-Benz Stadium, Atlanta',3),

-- Grupo F
('F1','group','F','ned','tun','scheduled','2026-06-15T23:00:00Z','Levi''s Stadium, San Francisco',1),
('F2','group','F','jpn','swe','scheduled','2026-06-16T02:00:00Z','Lumen Field, Seattle',1),
('F3','group','F','ned','jpn','scheduled','2026-06-21T20:00:00Z','Levi''s Stadium, San Francisco',2),
('F4','group','F','swe','tun','scheduled','2026-06-22T20:00:00Z','Lumen Field, Seattle',2),
('F5','group','F','ned','swe','scheduled','2026-06-27T21:00:00Z','Levi''s Stadium, San Francisco',3),
('F6','group','F','jpn','tun','scheduled','2026-06-27T21:00:00Z','Lumen Field, Seattle',3),

-- Grupo G
('G1','group','G','bel','nzl','scheduled','2026-06-16T20:00:00Z','Gillette Stadium, Boston',1),
('G2','group','G','egy','irn','scheduled','2026-06-17T00:00:00Z','Lincoln Financial, Filadelfia',1),
('G3','group','G','bel','egy','scheduled','2026-06-22T23:00:00Z','Gillette Stadium, Boston',2),
('G4','group','G','irn','nzl','scheduled','2026-06-23T02:00:00Z','Lincoln Financial, Filadelfia',2),
('G5','group','G','bel','irn','scheduled','2026-06-28T21:00:00Z','Gillette Stadium, Boston',3),
('G6','group','G','egy','nzl','scheduled','2026-06-28T21:00:00Z','Lincoln Financial, Filadelfia',3),

-- Grupo H
('H1','group','H','esp','uru','scheduled','2026-06-17T02:00:00Z','Hard Rock Stadium, Miami',1),
('H2','group','H','cpv','ksa','scheduled','2026-06-17T20:00:00Z','Arrowhead Stadium, Kansas City',1),
('H3','group','H','esp','cpv','scheduled','2026-06-23T23:00:00Z','Hard Rock Stadium, Miami',2),
('H4','group','H','ksa','uru','scheduled','2026-06-24T02:00:00Z','Arrowhead Stadium, Kansas City',2),
('H5','group','H','esp','ksa','scheduled','2026-06-28T21:00:00Z','Hard Rock Stadium, Miami',3),
('H6','group','H','cpv','uru','scheduled','2026-06-28T21:00:00Z','Arrowhead Stadium, Kansas City',3),

-- Grupo I
('I1','group','I','fra','nor','scheduled','2026-06-18T02:00:00Z','MetLife Stadium, Nueva York',1),
('I2','group','I','sen','irq','scheduled','2026-06-18T20:00:00Z','SoFi Stadium, Los Ángeles',1),
('I3','group','I','fra','sen','scheduled','2026-06-24T02:00:00Z','MetLife Stadium, Nueva York',2),
('I4','group','I','irq','nor','scheduled','2026-06-23T20:00:00Z','SoFi Stadium, Los Ángeles',2),
('I5','group','I','fra','irq','scheduled','2026-06-29T21:00:00Z','MetLife Stadium, Nueva York',3),
('I6','group','I','sen','nor','scheduled','2026-06-29T21:00:00Z','SoFi Stadium, Los Ángeles',3),

-- Grupo J
('J1','group','J','arg','jor','scheduled','2026-06-18T23:00:00Z','Estadio Azteca, Ciudad de México',1),
('J2','group','J','alg','aut','scheduled','2026-06-19T02:00:00Z','Estadio BBVA, Monterrey',1),
('J3','group','J','arg','alg','scheduled','2026-06-24T23:00:00Z','Estadio Akron, Guadalajara',2),
('J4','group','J','aut','jor','scheduled','2026-06-25T02:00:00Z','Estadio Azteca, Ciudad de México',2),
('J5','group','J','arg','aut','scheduled','2026-06-29T21:00:00Z','Estadio BBVA, Monterrey',3),
('J6','group','J','alg','jor','scheduled','2026-06-29T21:00:00Z','Estadio Akron, Guadalajara',3),

-- Grupo K
('K1','group','K','por','col','scheduled','2026-06-19T20:00:00Z','AT&T Stadium, Dallas',1),
('K2','group','K','cod','uzb','scheduled','2026-06-19T23:00:00Z','NRG Stadium, Houston',1),
('K3','group','K','por','cod','scheduled','2026-06-25T23:00:00Z','AT&T Stadium, Dallas',2),
('K4','group','K','uzb','col','scheduled','2026-06-25T20:00:00Z','NRG Stadium, Houston',2),
('K5','group','K','por','uzb','scheduled','2026-06-30T21:00:00Z','AT&T Stadium, Dallas',3),
('K6','group','K','cod','col','scheduled','2026-06-30T21:00:00Z','NRG Stadium, Houston',3),

-- Grupo L
('L1','group','L','eng','pan','scheduled','2026-06-20T20:00:00Z','BC Place, Vancouver',1),
('L2','group','L','cro','gha','scheduled','2026-06-20T23:00:00Z','BMO Field, Toronto',1),
('L3','group','L','eng','cro','scheduled','2026-06-26T23:00:00Z','BC Place, Vancouver',2),
('L4','group','L','gha','pan','scheduled','2026-06-26T02:00:00Z','Lumen Field, Seattle',2),
('L5','group','L','eng','gha','scheduled','2026-07-01T21:00:00Z','BC Place, Vancouver',3),
('L6','group','L','cro','pan','scheduled','2026-07-01T21:00:00Z','BMO Field, Toronto',3);

-- ─── Fase eliminatoria (equipos por determinar) ───────────────────────────────

insert into public.matches
  (id, phase, status, scheduled_at, venue, round_slot)
values

-- Dieciseisavos de final (R32)
('P73', 'round_of_32','scheduled','2026-06-28T20:00:00Z','Por determinar',1),
('P74', 'round_of_32','scheduled','2026-06-29T20:00:00Z','Por determinar',2),
('P75', 'round_of_32','scheduled','2026-06-29T23:00:00Z','Por determinar',3),
('P76', 'round_of_32','scheduled','2026-06-29T02:00:00Z','Por determinar',4),
('P77', 'round_of_32','scheduled','2026-06-30T20:00:00Z','Por determinar',5),
('P78', 'round_of_32','scheduled','2026-06-30T23:00:00Z','Por determinar',6),
('P79', 'round_of_32','scheduled','2026-06-30T02:00:00Z','Por determinar',7),
('P80', 'round_of_32','scheduled','2026-07-01T20:00:00Z','Por determinar',8),
('P81', 'round_of_32','scheduled','2026-07-01T23:00:00Z','Por determinar',9),
('P82', 'round_of_32','scheduled','2026-07-01T02:00:00Z','Por determinar',10),
('P83', 'round_of_32','scheduled','2026-07-02T20:00:00Z','Por determinar',11),
('P84', 'round_of_32','scheduled','2026-07-02T23:00:00Z','Por determinar',12),
('P85', 'round_of_32','scheduled','2026-07-02T02:00:00Z','Por determinar',13),
('P86', 'round_of_32','scheduled','2026-07-03T20:00:00Z','Por determinar',14),
('P87', 'round_of_32','scheduled','2026-07-03T23:00:00Z','Por determinar',15),
('P88', 'round_of_32','scheduled','2026-07-03T02:00:00Z','Por determinar',16),

-- Octavos de final (R16)
('P89', 'round_of_16','scheduled','2026-07-04T20:00:00Z','Por determinar',1),
('P90', 'round_of_16','scheduled','2026-07-04T00:00:00Z','Por determinar',2),
('P91', 'round_of_16','scheduled','2026-07-05T20:00:00Z','Por determinar',3),
('P92', 'round_of_16','scheduled','2026-07-05T00:00:00Z','Por determinar',4),
('P93', 'round_of_16','scheduled','2026-07-06T20:00:00Z','Por determinar',5),
('P94', 'round_of_16','scheduled','2026-07-06T00:00:00Z','Por determinar',6),
('P95', 'round_of_16','scheduled','2026-07-07T20:00:00Z','Por determinar',7),
('P96', 'round_of_16','scheduled','2026-07-07T00:00:00Z','Por determinar',8),

-- Cuartos de final
('P97',  'quarterfinal','scheduled','2026-07-09T20:00:00Z','Por determinar',1),
('P98',  'quarterfinal','scheduled','2026-07-10T20:00:00Z','Por determinar',2),
('P99',  'quarterfinal','scheduled','2026-07-11T20:00:00Z','Por determinar',3),
('P100', 'quarterfinal','scheduled','2026-07-11T00:00:00Z','Por determinar',4),

-- Semifinales
('P101','semifinal','scheduled','2026-07-14T21:00:00Z','Por determinar',1),
('P102','semifinal','scheduled','2026-07-15T21:00:00Z','Por determinar',2),

-- Tercer puesto y Final
('P103','third_place','scheduled','2026-07-18T20:00:00Z','Por determinar',1),
('P104','final',      'scheduled','2026-07-19T20:00:00Z','Por determinar',1);
