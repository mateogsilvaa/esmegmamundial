-- ============================================================
--  MUNDIAL 2026 — Limpieza total
--  ⚠️  BORRA TODO lo relacionado con el proyecto.
--  Ejecutar ANTES de 01_schema.sql
-- ============================================================

-- Triggers sobre auth.users
drop trigger if exists on_auth_user_created on auth.users;

-- Funciones
drop function if exists public.handle_new_user()         cascade;
drop function if exists public.handle_updated_at()       cascade;

-- Tablas nuevas (en orden inverso de dependencias)
drop table if exists public.match_bonus_predictions  cascade;
drop table if exists public.third_place_predictions  cascade;
drop table if exists public.group_order_predictions  cascade;
drop table if exists public.leaderboard              cascade;
drop table if exists public.bracket_predictions      cascade;
drop table if exists public.group_predictions        cascade;
drop table if exists public.predictions              cascade;
drop table if exists public.matches                  cascade;
drop table if exists public.profiles                 cascade;

-- Storage: bucket avatars (si existiera)
delete from storage.objects  where bucket_id = 'avatars';
delete from storage.buckets  where id = 'avatars';
