INSERT INTO public.profiles (id,full_name,email,avatar_url,role,created_at) VALUES
('2bb967c2-d452-4a11-ab6f-7baa3ab92f8c','Abdullah Abyad Raied','raied@10minuteschool.com',NULL,NULL,'2026-03-31 05:09:54.129355+00'),
('7c124c71-dfea-41d5-abfe-50ed68d99a7a','Farhana Quayyum','farhana@10minuteschool.com',NULL,NULL,'2026-03-31 05:51:26.013971+00'),
('0e3dfb96-b649-49e5-a87d-3d9044471c70','Md Mishal Bin Salim','mishal@10minuteschool.com','https://wxwoazvqmdvgghdqzdln.supabase.co/storage/v1/object/public/avatars/0e3dfb96-b649-49e5-a87d-3d9044471c70/avatar.png?t=1774936689145','PM','2026-03-31 05:52:51.29339+00'),
('dd75b956-474f-4a41-bb25-e3de30a74119','Ayman Sadiq','ayman@10minuteschool.com',NULL,NULL,'2026-03-31 06:34:14.131907+00'),
('eb374c12-1fcd-45f5-8f93-de0716a40e1b','Rabeya Begum Mim','rabeya.mim@10minuteschool.com',NULL,'BI','2026-03-31 04:58:29.856458+00'),
('06ab655c-63d6-4258-97e1-d0dc176b3cac','Sanjida Siddiqua','sanjida.siddiqua@10minuteschool.com',NULL,'PM','2026-03-08 05:44:35.845672+00'),
('6be9ac3f-4320-41ce-a71a-f097b163feb6','Uttam Deb','uttam@10minuteschool.com',NULL,'BI','2026-04-02 07:55:56.283748+00'),
('26c1816d-da94-466d-b7a7-57ea6b46b6a6','Uttam Deb','uttamdeb670@gmail.com',NULL,'BI','2026-03-18 11:45:31.386077+00'),
('3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9','Uttam Deb','uttamdeb670@outlook.com','https://wxwoazvqmdvgghdqzdln.supabase.co/storage/v1/object/public/avatars/3cff3c68-2f8e-4f73-8a89-d84bdebaa1e9/avatar.png?t=1773817990197','BI','2026-03-08 05:44:35.845672+00')
ON CONFLICT (id) DO NOTHING;