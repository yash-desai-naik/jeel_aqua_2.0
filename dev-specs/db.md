ALTER TABLE tbl_orders ADD is_deleted TINYINT(4) NOT NULL DEFAULT 0 AFTER notes;
ALTER TABLE tbl_orders ADD INDEX idx_is_deleted (is_deleted);