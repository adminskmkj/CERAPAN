-- Gabungkan rekod lama PENCERAPAN KETUA PANITIA ke PENCERAPAN PERTAMA
update cerapan
set sesi_pengisian = 'PENCERAPAN PERTAMA'
where sesi_pengisian = 'PENCERAPAN KETUA PANITIA';