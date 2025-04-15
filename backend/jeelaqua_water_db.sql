-- phpMyAdmin SQL Dump
-- version 4.9.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 02, 2025 at 04:16 PM
-- Server version: 5.7.44
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jeelaqua_water_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `paymentdetails`
--

CREATE TABLE `paymentdetails` (
  `ID` int(11) NOT NULL,
  `CustomerId` varbinary(12) DEFAULT NULL,
  `CollectionBoyId` varbinary(12) DEFAULT NULL,
  `CurrentReading` longtext,
  `PendingAmount` longtext,
  `TotalAmount` longtext,
  `PaidAmount` longtext,
  `PaymentDate` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `discount` varchar(900) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_cms`
--

CREATE TABLE `tbl_cms` (
  `id` int(11) NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `type` enum('audio','video','text','other') NOT NULL DEFAULT 'text',
  `file_upload` text,
  `is_active` tinyint(4) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_enquiry`
--

CREATE TABLE `tbl_enquiry` (
  `id` int(11) NOT NULL,
  `fullname` varchar(600) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `referral_code` varchar(20) DEFAULT NULL,
  `address` text,
  `city` varchar(300) NOT NULL,
  `created_at` datetime NOT NULL,
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_measures`
--

CREATE TABLE `tbl_measures` (
  `id` int(11) NOT NULL,
  `title` varchar(400) NOT NULL,
  `notes` text,
  `is_active` tinyint(4) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_orders`
--

CREATE TABLE `tbl_orders` (
  `id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `price` double NOT NULL,
  `sub_total` double NOT NULL,
  `discount` double NOT NULL DEFAULT '0',
  `grand_total` double NOT NULL,
  `created_at` datetime NOT NULL,
  `notes` text
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_order_delivery`
--

CREATE TABLE `tbl_order_delivery` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `delivery_boy_id` int(11) NOT NULL,
  `delivery_date` date NOT NULL,
  `qty_ordered` int(11) NOT NULL DEFAULT '1',
  `qty_return` int(11) NOT NULL DEFAULT '0',
  `total_amount` double NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `notes` text
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_order_status`
--

CREATE TABLE `tbl_order_status` (
  `id` int(11) NOT NULL,
  `status_title` varchar(300) NOT NULL,
  `status_priety` varchar(300) NOT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_order_status_history`
--

CREATE TABLE `tbl_order_status_history` (
  `id` int(11) NOT NULL,
  `order_delivery_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL DEFAULT '1',
  `updated_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_payment_history`
--

CREATE TABLE `tbl_payment_history` (
  `id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `payment_mode` enum('cash','cheque','paytm','gpay','phonepe','netbanking') NOT NULL DEFAULT 'cash',
  `payment_received_by` int(11) NOT NULL,
  `payment_received` int(11) NOT NULL,
  `payment_due` int(11) NOT NULL,
  `notes` text,
  `created_at` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_role`
--

CREATE TABLE `tbl_role` (
  `id` int(11) NOT NULL,
  `rolename` varchar(300) NOT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT '1' COMMENT '1 - active, 0 - inactive',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_services`
--

CREATE TABLE `tbl_services` (
  `id` int(11) NOT NULL,
  `title` varchar(600) NOT NULL,
  `qty` double NOT NULL,
  `measure_id` int(11) NOT NULL,
  `price` double NOT NULL,
  `notes` text,
  `is_active` tinyint(4) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `service_img` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_settings`
--

CREATE TABLE `tbl_settings` (
  `id` int(11) NOT NULL,
  `mobile_no` varchar(100) NOT NULL DEFAULT '-',
  `email` varchar(400) NOT NULL DEFAULT '-',
  `address` varchar(900) NOT NULL DEFAULT '-',
  `logo` text NOT NULL,
  `updated_at` date DEFAULT NULL,
  `facebook_url` varchar(700) DEFAULT NULL,
  `twitter_url` varchar(700) DEFAULT NULL,
  `instagram_url` varchar(700) DEFAULT NULL,
  `linkedin_url` varchar(700) DEFAULT NULL,
  `ref_giver_point` double NOT NULL DEFAULT '0',
  `ref_receiver_point` double NOT NULL DEFAULT '0',
  `point_to_amount` double DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_society`
--

CREATE TABLE `tbl_society` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `zone_id` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(600) NOT NULL,
  `lastname` varchar(600) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `password` text NOT NULL,
  `email` varchar(800) DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `address_1` text,
  `address_2` text,
  `city` varchar(600) NOT NULL,
  `state` varchar(600) NOT NULL,
  `lattitude` decimal(10,0) DEFAULT NULL,
  `longitude` decimal(10,0) DEFAULT NULL,
  `zone_id` int(11) DEFAULT NULL,
  `society_id` int(11) DEFAULT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `referral_code` text NOT NULL,
  `referral_points` int(11) NOT NULL DEFAULT '0',
  `token` text,
  `total_quantity_remain` int(11) NOT NULL DEFAULT '0',
  `deposit` double NOT NULL DEFAULT '0',
  `total_amount` double NOT NULL DEFAULT '0',
  `due_amount` double NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_zone`
--

CREATE TABLE `tbl_zone` (
  `id` int(11) NOT NULL,
  `title` text NOT NULL,
  `from_area` text,
  `to_area` text,
  `is_active` tinyint(4) NOT NULL DEFAULT '1' COMMENT '1 - active, 0 - inactive',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1 - deleted, 0 - not deleted',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `paymentdetails`
--
ALTER TABLE `paymentdetails`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `tbl_cms`
--
ALTER TABLE `tbl_cms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_enquiry`
--
ALTER TABLE `tbl_enquiry`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_measures`
--
ALTER TABLE `tbl_measures`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_orders`
--
ALTER TABLE `tbl_orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_order_delivery`
--
ALTER TABLE `tbl_order_delivery`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_order_status`
--
ALTER TABLE `tbl_order_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_order_status_history`
--
ALTER TABLE `tbl_order_status_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_payment_history`
--
ALTER TABLE `tbl_payment_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_role`
--
ALTER TABLE `tbl_role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_services`
--
ALTER TABLE `tbl_services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_society`
--
ALTER TABLE `tbl_society`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `tbl_zone`
--
ALTER TABLE `tbl_zone`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `paymentdetails`
--
ALTER TABLE `paymentdetails`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_cms`
--
ALTER TABLE `tbl_cms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_enquiry`
--
ALTER TABLE `tbl_enquiry`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_measures`
--
ALTER TABLE `tbl_measures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_orders`
--
ALTER TABLE `tbl_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_order_delivery`
--
ALTER TABLE `tbl_order_delivery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_order_status`
--
ALTER TABLE `tbl_order_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_order_status_history`
--
ALTER TABLE `tbl_order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_payment_history`
--
ALTER TABLE `tbl_payment_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_role`
--
ALTER TABLE `tbl_role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_services`
--
ALTER TABLE `tbl_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_society`
--
ALTER TABLE `tbl_society`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_zone`
--
ALTER TABLE `tbl_zone`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
