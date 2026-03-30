delete from public.recommendations where name = 'Felix Müllers';

alter table public.recommendations add column context text;

update public.recommendations set context = 'I worked closely with Miha for over two years at Advisable.' where name = 'Miha Rekar';
update public.recommendations set context = 'I worked closely with Marina for over two years at Advisable.' where name = 'Marina Krizman';
update public.recommendations set context = 'I worked closely with Yurko for over two years at Advisable.' where name = 'Yurko Turskiy';
update public.recommendations set context = 'I worked closely with John for over three years at Advisable.' where name like 'John O%';
update public.recommendations set context = 'I worked closely with Annie for over a year at Advisable.' where name = 'Annie Nguyen';
update public.recommendations set context = 'I worked closely with Alex for over a year at Advisable.' where name = 'Alex Lazar';
update public.recommendations set context = 'I worked closely with Jonathan for over two years at Advisable.' where name = 'Jonathan Bailey';
update public.recommendations set context = 'I worked closely with Thomas for over three years at Advisable.' where name = 'Thomas Cullen';
update public.recommendations set context = 'I worked closely with Sofía for over a year at Advisable.' where name like 'Sof%';
