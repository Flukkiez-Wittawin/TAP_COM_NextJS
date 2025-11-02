-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.12.0.7122
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table auctiondb.auctionbids: ~4 rows (approximately)
INSERT IGNORE INTO `auctionbids` (`auctionbid_id`, `amount`, `is_highest`, `Users_user_id`, `Auctions_auction_id`) VALUES
	('007e42d8-cd2c-4c', 500, 'N', 'TAP-002', '83f3670447b54417'),
	('149d17fc-5bb6-43', 1100, 'N', 'TAP-002', '642be4f97fa14c14'),
	('25d29e1b-b379-45', 91500, 'Y', 'TAP-001', '642be4f97fa14c14'),
	('f464d5f9-38c0-4a', 1000, 'Y', 'TAP-001', '83f3670447b54417');

-- Dumping data for table auctiondb.auctions: ~5 rows (approximately)
INSERT IGNORE INTO `auctions` (`auction_id`, `auction_name`, `auction_desc`, `auction_bid_min`, `auction_bid_max`, `Users_user_id`, `AuctionStatus_status_id`, `AuctionType_auction_type_id`) VALUES
	('070c08830ca541d1', 'FLKZ-003', 'TestTTT', 100, 10000, 'TAP-002', 'S01', 'T01'),
	('5961529122a64dc3', 'FF', '1ewfdssdf', 100, 50000, 'TAP-002', 'S01', 'T02'),
	('642be4f97fa14c14', 'FLKZ-001', 'cxujbhvuicxvhbuichvibjhncvikjnbijcvnbivc LOREM', 100, 10000, 'TAP-002', 'S03', 'T01'),
	('83f3670447b54417', 'FLKZ-02', 'zsdcxzcvxcv', 1000, 100000, 'TAP-002', 'S03', 'T02'),
	('A001', 'Antique Vase', 'A beautiful antique vase', 1000, 5000, 'U003', 'S03', 'T01');

-- Dumping data for table auctiondb.auctionstatus: ~3 rows (approximately)
INSERT IGNORE INTO `auctionstatus` (`status_id`, `status_name`) VALUES
	('S01', 'Pending'),
	('S02', 'Active'),
	('S03', 'Closed');

-- Dumping data for table auctiondb.auctiontype: ~2 rows (approximately)
INSERT IGNORE INTO `auctiontype` (`auction_type_id`, `auction_type_name`) VALUES
	('T01', 'FirstHand'),
	('T02', 'SecondHand');

-- Dumping data for table auctiondb.auction_date: ~4 rows (approximately)
INSERT IGNORE INTO `auction_date` (`auction_date_id`, `auction_id`, `start_time`, `end_time`) VALUES
	('1dee813f77a346be', '070c08830ca541d1', '2025-11-02 23:14:00', '2025-11-27 23:14:00'),
	('509336cde1b0431d', '642be4f97fa14c14', '2025-11-02 22:42:00', '2025-11-12 22:42:00'),
	('6ee0fead1c3349e6', '5961529122a64dc3', '2025-11-02 23:16:00', '2025-11-14 23:16:00'),
	('dfe6c3dc999d4119', '83f3670447b54417', '2025-11-02 13:15:00', '2025-11-13 13:15:00');

-- Dumping data for table auctiondb.auction_image: ~10 rows (approximately)
INSERT IGNORE INTO `auction_image` (`image_id`, `image_name`, `Auctions_auction_id`) VALUES
	('IMG_1762064141835_692', 'ttxx.jpg', '83f3670447b54417'),
	('IMG_1762064141837_169', 'images.jpg', '83f3670447b54417'),
	('IMG_1762064141838_975', 'sSPccMADUsr_large.jpg', '83f3670447b54417'),
	('IMG_1762064141840_124', 'sS20NC8O1y9N_large.jpg', '83f3670447b54417'),
	('IMG_1762098171152_504', 'ttxx.jpg', '642be4f97fa14c14'),
	('IMG_1762098171155_571', 'images.jpg', '642be4f97fa14c14'),
	('IMG_1762098171157_958', 'sSPccMADUsr_large.jpg', '642be4f97fa14c14'),
	('IMG_1762098171159_947', 'sS20NC8O1y9N_large.jpg', '642be4f97fa14c14'),
	('IMG_1762100181294_859', 'images.jpg', '5961529122a64dc3'),
	('IMG_1762100181296_843', 'sSPccMADUsr_large.jpg', '5961529122a64dc3');

-- Dumping data for table auctiondb.payment: ~1 rows (approximately)
INSERT IGNORE INTO `payment` (`payment_id`, `paystatus`, `total_price`, `paytype`, `payment_date`, `Users_user_id`, `Auctions_auction_id`) VALUES
	('P001', 'Paid', 1200, 'Credit Card', '2025-11-02', 'U002', 'A001');

-- Dumping data for table auctiondb.role: ~3 rows (approximately)
INSERT IGNORE INTO `role` (`role_id`, `role_name`) VALUES
	('R001', 'Default Role'),
	('R002', 'Bidder'),
	('R003', 'Seller');

-- Dumping data for table auctiondb.usergroup: ~3 rows (approximately)
INSERT IGNORE INTO `usergroup` (`group_id`, `group_name`) VALUES
	('G001', 'Default Group'),
	('G002', 'Admin'),
	('G003', 'SuperAdmin');

-- Dumping data for table auctiondb.users: ~5 rows (approximately)
INSERT IGNORE INTO `users` (`user_id`, `email`, `fname`, `lname`, `phone`, `address`, `citizen_id`, `Group_group_id`, `Role_role_id`, `avatar`) VALUES
	('TAP-001', 'flkz.developer@gmail.com', 'FlukKieZ', 'Wittawin', '0952875776', 'WWWXX', '145555', 'G001', 'R002', '/uploads/avatars/1762058043881-sS20NC8O1y9N_large.jpg'),
	('TAP-002', 'exslayknightblood@gmail.com', 'FlukKieZ', 'Tester', '0952875776', 'WWWXX', '145555', 'G001', 'R003', '/uploads/avatars/1762095391569-ttxx.jpg'),
	('U001', 'admin@example.com', 'Alice', 'Smith', '0812345678', '123 Admin St', '1234567890123', 'G001', 'R001', NULL),
	('U002', 'bidder@example.com', 'Bob', 'Brown', '0898765432', '456 Bidder Rd', '9876543210987', 'G001', 'R001', NULL),
	('U003', 'seller@example.com', 'Carol', 'White', '0876543210', '789 Seller Ave', '4567890123456', 'G001', 'R001', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
