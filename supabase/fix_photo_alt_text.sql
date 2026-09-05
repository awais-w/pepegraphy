-- Fix gallery photo alternative text translations.
-- Run this in the Supabase SQL Editor if photo alt text does not switch to Hungarian.

update public.gallery_photos
set
  alt_text_hu = case image_url
    when '/gallery/img_1.jpg' then 'Színpad előadás'
    when '/gallery/img_2.jpg' then 'Tűzvarjú a természetben'
    when '/gallery/img_3.jpg' then 'Légi akrobata előadás'
    when '/gallery/img_4.jpg' then 'Mopsz kutya szülinapi kalappal'
    when '/gallery/img_5.jpg' then 'DJ esemény riport fotózás'
    when '/gallery/img_6.jpg' then 'Női portré flitteres ruha'
    when '/gallery/img_7.jpg' then 'Boudoir portré sminkasztalnál'
    when '/gallery/img_8.jpg' then 'Gyermek portré téli kapucnis'
    when '/gallery/img_9.jpg' then 'Férfi portré'
    when '/gallery/img_10.jpg' then 'Női portré kalappal és kesztyűvel'
    when '/gallery/img_12.jpg' then 'Női portré szabadban'
    when '/gallery/img_13.jpg' then 'Női művészi portré'
    when '/gallery/img_14.jpg' then 'Vöröshajú női portré close-up'
    when '/gallery/img_15.jpg' then 'Női portré tavaszi virágokkal'
    when '/gallery/img_16.jpg' then 'Női teljes hosszú portré'
    when '/gallery/img_18.jpg' then 'Női portré szabadban (közepes close-up)'
    else alt_text_hu
  end
where image_url in (
  '/gallery/img_1.jpg', '/gallery/img_2.jpg', '/gallery/img_3.jpg', '/gallery/img_4.jpg',
  '/gallery/img_5.jpg', '/gallery/img_6.jpg', '/gallery/img_7.jpg', '/gallery/img_8.jpg',
  '/gallery/img_9.jpg', '/gallery/img_10.jpg', '/gallery/img_12.jpg', '/gallery/img_13.jpg',
  '/gallery/img_14.jpg', '/gallery/img_15.jpg', '/gallery/img_16.jpg', '/gallery/img_18.jpg'
);
