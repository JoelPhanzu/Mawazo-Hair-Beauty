CREATE TABLE `audit_log` (
	`id` varchar(36) NOT NULL,
	`table_name` varchar(64) NOT NULL,
	`record_id` varchar(36),
	`action` varchar(10) NOT NULL,
	`user_id` varchar(36),
	`old_values` longtext,
	`new_values` longtext,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` varchar(36) NOT NULL,
	`reference` varchar(12) NOT NULL,
	`customer_name` varchar(120) NOT NULL,
	`customer_phone` varchar(16) NOT NULL,
	`service_id` varchar(36),
	`service_name` varchar(120) NOT NULL,
	`requested_date` date NOT NULL,
	`requested_time` varchar(5) NOT NULL,
	`message` text,
	`status` varchar(12) NOT NULL DEFAULT 'nouvelle',
	`internal_note` text,
	`source` varchar(10) NOT NULL DEFAULT 'site',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `gallery_items` (
	`id` varchar(36) NOT NULL,
	`title` varchar(120),
	`before_image_url` varchar(500),
	`after_image_url` varchar(500) NOT NULL,
	`service_id` varchar(36),
	`caption` varchar(255),
	`position` int NOT NULL DEFAULT 0,
	`is_published` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `gallery_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` varchar(36) NOT NULL,
	`path` varchar(255) NOT NULL,
	`mime_type` varchar(50) NOT NULL,
	`width` int,
	`height` int,
	`size_bytes` int NOT NULL,
	`alt` varchar(255),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36),
	`product_name` varchar(120) NOT NULL,
	`variant` longtext NOT NULL,
	`quantity` int NOT NULL,
	`unit_price_amount` int NOT NULL,
	`discount_amount` int NOT NULL DEFAULT 0,
	`promotion_id` varchar(36),
	`currency` varchar(3) NOT NULL DEFAULT 'CDF',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`reference` varchar(12) NOT NULL,
	`customer_name` varchar(120) NOT NULL,
	`customer_phone` varchar(16) NOT NULL,
	`delivery_commune` varchar(80),
	`delivery_address` varchar(255),
	`total_amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CDF',
	`payment_method` varchar(16) NOT NULL,
	`payment_reference` varchar(80),
	`status` varchar(12) NOT NULL DEFAULT 'nouvelle',
	`message` text,
	`internal_note` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `page_sections` (
	`id` varchar(36) NOT NULL,
	`key` varchar(60) NOT NULL,
	`title` varchar(200),
	`subtitle` varchar(300),
	`body` text,
	`image_url` varchar(500),
	`secondary_image_url` varchar(500),
	`button_label` varchar(60),
	`button_href` varchar(255),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `page_sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `page_sections_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `password_resets` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `password_resets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`excerpt` varchar(300),
	`content` text,
	`image_url` varchar(500),
	`category` varchar(80),
	`reading_minutes` int,
	`published_at` datetime,
	`seo_title` varchar(200),
	`seo_description` varchar(300),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`image_url` varchar(500),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `product_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`description` text,
	`price_amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CDF',
	`compare_at_amount` int,
	`stock` int,
	`variants` longtext NOT NULL,
	`images` longtext NOT NULL,
	`is_published` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `products_price_positive` CHECK(`price_amount` >= 0)
);
--> statement-breakpoint
CREATE TABLE `promotion_targets` (
	`id` varchar(36) NOT NULL,
	`promotion_id` varchar(36) NOT NULL,
	`target_type` varchar(20) NOT NULL,
	`target_id` varchar(36) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `promotion_targets_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotion_targets_unique` UNIQUE(`promotion_id`,`target_type`,`target_id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` varchar(36) NOT NULL,
	`title` varchar(120) NOT NULL,
	`subtitle` varchar(200),
	`description` text,
	`badge` varchar(40),
	`banner_url` varchar(500),
	`discount_type` varchar(20) NOT NULL,
	`discount_value` int NOT NULL DEFAULT 0,
	`scope` varchar(20) NOT NULL,
	`starts_at` datetime,
	`ends_at` datetime,
	`weekdays` longtext,
	`cta_label` varchar(40),
	`cta_href` varchar(255),
	`is_active` boolean NOT NULL DEFAULT false,
	`show_banner` boolean NOT NULL DEFAULT false,
	`priority` int NOT NULL DEFAULT 0,
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_categories` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`image_url` varchar(500),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `service_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `service_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`short_description` varchar(255),
	`long_description` text,
	`duration_min_minutes` int,
	`duration_max_minutes` int,
	`price_amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CDF',
	`price_is_from` boolean NOT NULL DEFAULT false,
	`image_url` varchar(500),
	`gallery` longtext NOT NULL,
	`is_published` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `services_price_positive` CHECK(`price_amount` >= 0)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int NOT NULL DEFAULT 1,
	`business_name` varchar(120) NOT NULL,
	`tagline` varchar(200),
	`phone` varchar(20),
	`whatsapp_number` varchar(20) NOT NULL,
	`emails` longtext NOT NULL,
	`address` varchar(255),
	`google_maps_url` varchar(500),
	`opening_hours` longtext NOT NULL,
	`social_links` longtext NOT NULL,
	`payment_numbers` longtext NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CDF',
	`usd_to_cdf_rate` int,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` varchar(36) NOT NULL,
	`display_name` varchar(60) NOT NULL,
	`body` text NOT NULL,
	`rating` smallint,
	`service_id` varchar(36),
	`consent_obtained` boolean NOT NULL DEFAULT false,
	`is_published` boolean NOT NULL DEFAULT false,
	`position` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`),
	CONSTRAINT `testimonials_consent` CHECK(`is_published` = 0 OR `consent_obtained` = 1)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(191) NOT NULL,
	`full_name` varchar(120) NOT NULL,
	`password_hash` varchar(100) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'editor',
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` datetime,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gallery_items` ADD CONSTRAINT `gallery_items_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_product_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promotion_targets` ADD CONSTRAINT `promotion_targets_promotion_id_promotions_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_category_id_service_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `service_categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_log_record_idx` ON `audit_log` (`table_name`,`record_id`);--> statement-breakpoint
CREATE INDEX `bookings_date_idx` ON `bookings` (`requested_date`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);