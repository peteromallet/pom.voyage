alter table public.recommendations add column status text not null default 'probably_unavailable';

update public.recommendations set status = 'hired' where name = 'Thomas Cullen';
update public.recommendations set status = 'taking_clients' where name like 'Sof%';
