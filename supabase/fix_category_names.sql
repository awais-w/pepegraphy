-- Fix gallery category names and bilingual fields.
-- Run this in the Supabase SQL Editor if categories still show slugs or Hungarian text in both languages.

update public.gallery_categories
set
  name = case slug
    when 'female' then 'Női'
    when 'male' then 'Férfi'
    when 'children' then 'Gyermekek'
    when 'pet' then 'Háziállat'
    when 'events' then 'Bulik'
    when 'reportage' then 'Riport'
    when 'nature' then 'Természet'
    when 'boudoir' then 'Boudoir'
    else name
  end,
  name_en = case slug
    when 'female' then 'Female'
    when 'male' then 'Male'
    when 'children' then 'Children'
    when 'pet' then 'Pets'
    when 'events' then 'Events'
    when 'reportage' then 'Reportage'
    when 'nature' then 'Nature'
    when 'boudoir' then 'Boudoir'
    else name_en
  end,
  name_hu = case slug
    when 'female' then 'Női'
    when 'male' then 'Férfi'
    when 'children' then 'Gyermekek'
    when 'pet' then 'Háziállat'
    when 'events' then 'Bulik'
    when 'reportage' then 'Riport'
    when 'nature' then 'Természet'
    when 'boudoir' then 'Boudoir'
    else name_hu
  end
where slug in ('female','male','children','pet','events','reportage','nature','boudoir');
