-- ============================================
-- ScoreZone Production Database Dump
-- Server: 192.168.0.200:3306
-- Database: scorezone_prod
-- Generation Time: Feb 13, 2026 at 00:00 AM
-- Server version: 8.0.36-MySQL
-- PHP Version: 8.2.15
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+01:00";

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(32) DEFAULT 'user',
  `email` varchar(128) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `email`) VALUES
(1, 'admin', 'admin123!@#', 'superadmin', 'admin@scorezone.local'),
(2, 'db_manager', 'M@nag3r2026', 'admin', 'dbmgr@scorezone.local'),
(3, 'backup_user', 'B4ckUp!Srv', 'backup', 'backup@scorezone.local');

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE `players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `team` varchar(128) DEFAULT NULL,
  `position` varchar(32) DEFAULT NULL,
  `nationality` varchar(64) DEFAULT NULL,
  `goals` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `players`
--

INSERT INTO `players` (`id`, `name`, `team`, `position`, `nationality`, `goals`) VALUES
(1, 'Lionel Messi', 'Inter Miami', 'Forward', 'Argentina', 12),
(2, 'Cristiano Ronaldo', 'Al-Nassr', 'Forward', 'Portugal', 15),
(3, 'Kylian Mbappé', 'Real Madrid', 'Forward', 'France', 21),
(4, 'Mohamed Salah', 'Liverpool', 'Forward', 'Egypt', 18),
(5, 'Erling Haaland', 'Manchester City', 'Forward', 'Norway', 16),
(6, 'Jude Bellingham', 'Real Madrid', 'Midfielder', 'England', 10),
(7, 'Vinícius Júnior', 'Real Madrid', 'Forward', 'Brazil', 13),
(8, 'Kevin De Bruyne', 'Manchester City', 'Midfielder', 'Belgium', 7),
(9, 'Bukayo Saka', 'Arsenal', 'Forward', 'England', 11),
(10, 'Lamine Yamal', 'FC Barcelona', 'Forward', 'Spain', 8);

-- --------------------------------------------------------

--
-- Table structure for table `matches`
--

CREATE TABLE `matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `home_team` varchar(128) NOT NULL,
  `away_team` varchar(128) NOT NULL,
  `home_score` int(11) DEFAULT NULL,
  `away_score` int(11) DEFAULT NULL,
  `league` varchar(128) DEFAULT NULL,
  `match_date` datetime DEFAULT NULL,
  `status` enum('upcoming','live','finished') DEFAULT 'upcoming',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `admin_config`
--

CREATE TABLE `admin_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(64) NOT NULL,
  `config_value` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `admin_config` (`id`, `config_key`, `config_value`) VALUES
(1, 'db_host', '192.168.0.200'),
(2, 'db_name', 'scorezone_prod'),
(3, 'db_port', '3306'),
(4, 'backup_path', '/var/backups/scorezone/');

-- --------------------------------------------------------

--
-- Table structure for table `secret_flags`
--

CREATE TABLE `secret_flags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `flag_name` varchar(64) NOT NULL,
  `flag_value` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `hint` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `secret_flags`
--

INSERT INTO `secret_flags` (`id`, `flag_name`, `flag_value`, `created_at`, `hint`) VALUES
(1, 'CTF_MAIN_FLAG', 'Securinets_fst{SQL1_1nj3Cti0n_F0r_N00b5}', '2026-02-13 00:00:00', 'You found it!'),
(2, 'DECOY_1', 'NOT_THE_FLAG{try_harder}', '2026-01-01 00:00:00', 'Nice try...'),
(3, 'DECOY_2', 'FAKE{this_is_not_real}', '2025-12-15 00:00:00', 'Keep looking');

-- --------------------------------------------------------

COMMIT;

-- End of dump
