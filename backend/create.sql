CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image` longtext,
  `report_date` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `suggestion` text,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `feedback` text,
  `userId` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci