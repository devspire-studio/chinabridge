CREATE TYPE "public"."content_status" AS ENUM('active', 'inactive', 'published', 'draft');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('BDT', 'CNY', 'USD');--> statement-breakpoint
CREATE TYPE "public"."customer_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."customer_type" AS ENUM('retail', 'wholesale', 'reseller');--> statement-breakpoint
CREATE TYPE "public"."order_channel" AS ENUM('store', 'link_order', 'rfq', 'group_buy', 'wholesale');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending_payment', 'confirmed', 'purchased', 'china_warehouse', 'qc_passed', 'consolidated', 'in_transit', 'customs_clearance', 'arrived_bd', 'out_for_delivery', 'delivered', 'cancelled', 'returned');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('bkash', 'nagad', 'rocket', 'bank_transfer', 'card', 'wallet', 'cod');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'partial', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."banner_placement" AS ENUM('hero', 'home_mid', 'category_top', 'checkout');--> statement-breakpoint
CREATE TYPE "public"."po_status" AS ENUM('draft', 'placed', 'paid', 'shipped', 'received', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'draft', 'out_of_stock', 'archived');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('new', 'reviewing', 'quoted', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('published', 'pending', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('booking', 'loading', 'in_transit', 'at_port', 'customs', 'released', 'received_warehouse', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."shipping_mode" AS ENUM('air_express', 'air_standard', 'sea_lcl', 'sea_fcl');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('super_admin', 'admin', 'ops_manager', 'procurement', 'support', 'finance', 'content');--> statement-breakpoint
CREATE TYPE "public"."staff_status" AS ENUM('active', 'invited', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."supplier_status" AS ENUM('active', 'paused', 'blacklisted');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'pending', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."wallet_txn_type" AS ENUM('topup', 'order_payment', 'refund', 'cashback', 'withdraw', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."warehouse_type" AS ENUM('china_consolidation', 'bd_hub', 'bd_customs_bond', 'pickup_point');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"label" text DEFAULT 'Home' NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"alt_phone" text,
	"address_line" text NOT NULL,
	"area" text DEFAULT '' NOT NULL,
	"city" text DEFAULT 'Dhaka' NOT NULL,
	"district" text DEFAULT 'Dhaka' NOT NULL,
	"postcode" text,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor" text DEFAULT 'system' NOT NULL,
	"actor_role" text DEFAULT 'admin' NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text DEFAULT '' NOT NULL,
	"ip" text DEFAULT '127.0.0.1' NOT NULL,
	"meta" text DEFAULT '' NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"cta_label" text DEFAULT 'Shop now' NOT NULL,
	"cta_href" text DEFAULT '/shop' NOT NULL,
	"placement" "banner_placement" DEFAULT 'hero' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_bn" text DEFAULT '' NOT NULL,
	"slug" text NOT NULL,
	"icon" text DEFAULT '📦' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"service_fee_pct" double precision DEFAULT 10 NOT NULL,
	"duty_pct" double precision DEFAULT 25 NOT NULL,
	"parent_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text DEFAULT 'percent' NOT NULL,
	"value" double precision DEFAULT 0 NOT NULL,
	"min_order_bdt" integer DEFAULT 0 NOT NULL,
	"usage_limit" integer DEFAULT 100 NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"applies_to" text DEFAULT 'all' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"avatar" text,
	"type" "customer_type" DEFAULT 'retail' NOT NULL,
	"tier" "customer_tier" DEFAULT 'bronze' NOT NULL,
	"wallet_balance_bdt" integer DEFAULT 0 NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_spent_bdt" integer DEFAULT 0 NOT NULL,
	"due_bdt" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'active' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_order_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "group_buys" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"product_id" text,
	"image" text DEFAULT '' NOT NULL,
	"unit_price_bdt" integer DEFAULT 0 NOT NULL,
	"group_price_bdt" integer DEFAULT 0 NOT NULL,
	"min_members" integer DEFAULT 10 NOT NULL,
	"joined" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'live' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"source" text DEFAULT 'footer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"status" "order_status" NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"location" text,
	"actor" text DEFAULT 'system' NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"title" text NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"sku" text DEFAULT '' NOT NULL,
	"variant" text,
	"unit_price_bdt" integer DEFAULT 0 NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"weight_grams" integer DEFAULT 0 NOT NULL,
	"cbm" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"amount_bdt" integer DEFAULT 0 NOT NULL,
	"method" "payment_method" DEFAULT 'bkash' NOT NULL,
	"reference" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'success' NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"order_no" text NOT NULL,
	"customer_id" text,
	"customer_name" text DEFAULT '' NOT NULL,
	"customer_phone" text DEFAULT '' NOT NULL,
	"channel" "order_channel" DEFAULT 'store' NOT NULL,
	"status" "order_status" DEFAULT 'pending_payment' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"shipping_mode" "shipping_mode" DEFAULT 'air_standard' NOT NULL,
	"subtotal_bdt" integer DEFAULT 0 NOT NULL,
	"service_fee_bdt" integer DEFAULT 0 NOT NULL,
	"shipping_fee_bdt" integer DEFAULT 0 NOT NULL,
	"duty_bdt" integer DEFAULT 0 NOT NULL,
	"vat_bdt" integer DEFAULT 0 NOT NULL,
	"discount_bdt" integer DEFAULT 0 NOT NULL,
	"total_bdt" integer DEFAULT 0 NOT NULL,
	"paid_bdt" integer DEFAULT 0 NOT NULL,
	"weight_grams" integer DEFAULT 0 NOT NULL,
	"cbm" double precision DEFAULT 0 NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"shipment_id" text,
	"consignment_ref" text,
	"china_tracking_no" text,
	"courier" text,
	"courier_tracking_no" text,
	"coupon_code" text,
	"source_url" text,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"eta_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"cover" text DEFAULT '' NOT NULL,
	"author" text DEFAULT 'ChinaBridge Team' NOT NULL,
	"category" text DEFAULT 'Sourcing guide' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"read_minutes" integer DEFAULT 5 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"price_delta_bdt" integer DEFAULT 0 NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"sku" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"title_bn" text,
	"description" text DEFAULT '' NOT NULL,
	"category_id" text NOT NULL,
	"supplier_id" text,
	"brand" text DEFAULT '' NOT NULL,
	"origin_country" text DEFAULT 'China' NOT NULL,
	"source_url" text DEFAULT '' NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cost_price_cny" double precision DEFAULT 0 NOT NULL,
	"price_bdt" integer DEFAULT 0 NOT NULL,
	"compare_at_price_bdt" integer,
	"weight_grams" integer DEFAULT 500 NOT NULL,
	"cbm" double precision DEFAULT 0.001 NOT NULL,
	"moq" integer DEFAULT 1 NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"unit" text DEFAULT 'piece' NOT NULL,
	"rating" double precision DEFAULT 4.5 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"sold_count" integer DEFAULT 0 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "product_status" DEFAULT 'active' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"lead_time_days" integer DEFAULT 6 NOT NULL,
	"hs_code" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"purchase_order_id" text NOT NULL,
	"product_id" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_cost_cny" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"supplier_id" text,
	"supplier_name" text DEFAULT '' NOT NULL,
	"order_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_cny" double precision DEFAULT 0 NOT NULL,
	"paid_cny" double precision DEFAULT 0 NOT NULL,
	"status" "po_status" DEFAULT 'draft' NOT NULL,
	"warehouse" text DEFAULT 'Guangzhou DC-1' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expected_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"source_url" text DEFAULT '' NOT NULL,
	"source_platform" text DEFAULT '1688' NOT NULL,
	"product_name" text DEFAULT '' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"target_price_bdt" integer,
	"notes" text DEFAULT '' NOT NULL,
	"status" "quote_status" DEFAULT 'new' NOT NULL,
	"quoted_unit_price_bdt" integer,
	"quoted_total_bdt" integer,
	"assigned_to" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"product_title" text DEFAULT '' NOT NULL,
	"customer_id" text,
	"customer_name" text DEFAULT '' NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "review_status" DEFAULT 'published' NOT NULL,
	"helpful" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"brand_name" text DEFAULT 'ChinaBridge BD' NOT NULL,
	"brand_tagline" text DEFAULT '' NOT NULL,
	"support_phone" text DEFAULT '' NOT NULL,
	"support_email" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"cny_to_bdt" double precision DEFAULT 17.4 NOT NULL,
	"usd_to_bdt" double precision DEFAULT 122 NOT NULL,
	"service_fee_pct" double precision DEFAULT 10 NOT NULL,
	"min_service_fee_bdt" double precision DEFAULT 150 NOT NULL,
	"vat_pct" double precision DEFAULT 15 NOT NULL,
	"ait_pct" double precision DEFAULT 3 NOT NULL,
	"insurance_pct" double precision DEFAULT 1.5 NOT NULL,
	"free_shipping_threshold_bdt" double precision DEFAULT 50000 NOT NULL,
	"cod_fee_pct" double precision DEFAULT 2 NOT NULL,
	"advance_payment_pct" double precision DEFAULT 50 NOT NULL,
	"warehouse_storage_free_days" integer DEFAULT 15 NOT NULL,
	"storage_fee_per_cbm_bdt" double precision DEFAULT 2200 NOT NULL,
	"home_delivery_dhaka_bdt" double precision DEFAULT 80 NOT NULL,
	"home_delivery_outside_bdt" double precision DEFAULT 160 NOT NULL,
	"pickup_discount_bdt" double precision DEFAULT 50 NOT NULL,
	"exchange_rate_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"guest_checkout" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" text PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"mode" "shipping_mode" DEFAULT 'air_standard' NOT NULL,
	"status" "shipment_status" DEFAULT 'booking' NOT NULL,
	"origin_city" text DEFAULT 'Guangzhou' NOT NULL,
	"destination_city" text DEFAULT 'Dhaka' NOT NULL,
	"carrier" text DEFAULT '' NOT NULL,
	"awb_or_bl" text DEFAULT '' NOT NULL,
	"container_no" text,
	"cbm" double precision DEFAULT 0 NOT NULL,
	"weight_grams" integer DEFAULT 0 NOT NULL,
	"chargeable_weight_grams" integer DEFAULT 0 NOT NULL,
	"freight_cost_bdt" integer DEFAULT 0 NOT NULL,
	"duty_paid_bdt" integer DEFAULT 0 NOT NULL,
	"order_count" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"departed_at" timestamp with time zone,
	"eta_at" timestamp with time zone,
	"arrived_at" timestamp with time zone,
	"cleared_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"role" "staff_role" DEFAULT 'support' NOT NULL,
	"department" text DEFAULT 'Operations' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "staff_status" DEFAULT 'active' NOT NULL,
	"password_hash" text DEFAULT '' NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_cn" text DEFAULT '' NOT NULL,
	"platform" text DEFAULT '1688' NOT NULL,
	"city" text DEFAULT 'Guangzhou' NOT NULL,
	"contact_person" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"wechat" text DEFAULT '' NOT NULL,
	"rating" double precision DEFAULT 4.5 NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_spend_cny" double precision DEFAULT 0 NOT NULL,
	"on_time_rate" double precision DEFAULT 95 NOT NULL,
	"status" "supplier_status" DEFAULT 'active' NOT NULL,
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"author" text NOT NULL,
	"role" text DEFAULT 'customer' NOT NULL,
	"body" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"customer_id" text,
	"customer_name" text DEFAULT '' NOT NULL,
	"order_no" text,
	"subject" text NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"assigned_to" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"customer_name" text DEFAULT '' NOT NULL,
	"type" "wallet_txn_type" DEFAULT 'topup' NOT NULL,
	"amount_bdt" integer DEFAULT 0 NOT NULL,
	"balance_after_bdt" integer DEFAULT 0 NOT NULL,
	"method" "payment_method",
	"reference" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"country" text DEFAULT 'China' NOT NULL,
	"city" text DEFAULT 'Guangzhou' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"type" "warehouse_type" DEFAULT 'china_consolidation' NOT NULL,
	"capacity_cbm" double precision DEFAULT 500 NOT NULL,
	"used_cbm" double precision DEFAULT 0 NOT NULL,
	"staff" integer DEFAULT 4 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"contact" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" text DEFAULT 'customer' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"phone" text DEFAULT '' NOT NULL,
	"customer_id" text,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_buys" ADD CONSTRAINT "group_buys_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_payments" ADD CONSTRAINT "order_payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "order_events_order_idx" ON "order_events" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_no_idx" ON "orders" USING btree ("order_no");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_phone_idx" ON "user" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");