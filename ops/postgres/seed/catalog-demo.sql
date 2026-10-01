-- Демо-каталог для dev и нагрузочных проверок: 100 000 товаров, у каждого 1–3 варианта.
-- Запускать после миграций:
--   docker compose exec -T postgres psql -U marketadvanced -d marketadvanced < ops/postgres/seed/catalog-demo.sql
-- Повторный запуск откажется работать, если демо-данные уже есть.
--
-- Все записи помечены UserId = 00000000-0000-0000-0000-00000000d000. Удалить демо-данные:
--   DELETE FROM catalog."Product"          WHERE "UserId" = '00000000-0000-0000-0000-00000000d000';  -- варианты, фото, значения каскадом
--   DELETE FROM catalog."Category"         WHERE "UserId" = '00000000-0000-0000-0000-00000000d000' AND "ParentId" IS NOT NULL;
--   DELETE FROM catalog."Category"         WHERE "UserId" = '00000000-0000-0000-0000-00000000d000';
--   DELETE FROM catalog."Brand"            WHERE "UserId" = '00000000-0000-0000-0000-00000000d000';
--   DELETE FROM catalog."ProductAttribute" WHERE "UserId" = '00000000-0000-0000-0000-00000000d000';
--
-- Фото — внешние картинки picsum.photos: ImageUrl пока отдаётся как ImagePath (S3 не подключён).

\set ON_ERROR_STOP on
\set seed_user '''00000000-0000-0000-0000-00000000d000'''
\set products 100000

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM catalog."Product" WHERE "UserId" = '00000000-0000-0000-0000-00000000d000') THEN
    RAISE EXCEPTION 'Демо-данные уже загружены, сначала удалите их (см. комментарий в начале файла)';
  END IF;
END $$;

-- дерево категорий: корень -> подкатегория, item — как назвать товар в подкатегории
CREATE TEMP TABLE seed_category (root text, root_ord int, child text, child_ord int, item text) ON COMMIT DROP;
INSERT INTO seed_category VALUES
  ('Электроника', 1, 'Смартфоны',          1, 'Смартфон'),
  ('Электроника', 1, 'Ноутбуки',           2, 'Ноутбук'),
  ('Электроника', 1, 'Планшеты',           3, 'Планшет'),
  ('Электроника', 1, 'Наушники',           4, 'Наушники'),
  ('Электроника', 1, 'Умные часы',         5, 'Смарт-часы'),
  ('Бытовая техника', 2, 'Пылесосы',       1, 'Пылесос'),
  ('Бытовая техника', 2, 'Холодильники',   2, 'Холодильник'),
  ('Бытовая техника', 2, 'Стиральные машины', 3, 'Стиральная машина'),
  ('Бытовая техника', 2, 'Микроволновки',  4, 'Микроволновка'),
  ('Одежда', 3, 'Футболки',                1, 'Футболка'),
  ('Одежда', 3, 'Куртки',                  2, 'Куртка'),
  ('Одежда', 3, 'Джинсы',                  3, 'Джинсы'),
  ('Обувь', 4, 'Кроссовки',                1, 'Кроссовки'),
  ('Обувь', 4, 'Ботинки',                  2, 'Ботинки'),
  ('Обувь', 4, 'Сандалии',                 3, 'Сандалии'),
  ('Дом и сад', 5, 'Текстиль',             1, 'Плед'),
  ('Дом и сад', 5, 'Посуда',               2, 'Набор посуды'),
  ('Дом и сад', 5, 'Освещение',            3, 'Светильник'),
  ('Спорт', 6, 'Фитнес',                   1, 'Гантели'),
  ('Спорт', 6, 'Велосипеды',               2, 'Велосипед'),
  ('Детям', 7, 'Игрушки',                  1, 'Конструктор'),
  ('Детям', 7, 'Коляски',                  2, 'Коляска'),
  ('Красота', 8, 'Уход за кожей',          1, 'Крем'),
  ('Красота', 8, 'Парфюмерия',             2, 'Парфюм');

INSERT INTO catalog."Category" ("Id", "Name", "Slug", "ImagePath", "SortOrder", "CreatedAt", "UserId", "ParentId")
SELECT gen_random_uuid(), root, 'cat-' || root_ord, 'https://picsum.photos/seed/cat-' || root_ord || '/480/480', root_ord, now(), :seed_user, NULL
FROM (SELECT DISTINCT root, root_ord FROM seed_category) r;

INSERT INTO catalog."Category" ("Id", "Name", "Slug", "ImagePath", "SortOrder", "CreatedAt", "UserId", "ParentId")
SELECT gen_random_uuid(), s.child, 'cat-' || s.root_ord || '-' || s.child_ord,
       'https://picsum.photos/seed/cat-' || s.root_ord || '-' || s.child_ord || '/480/480', s.child_ord, now(), :seed_user, p."Id"
FROM seed_category s
JOIN catalog."Category" p ON p."Name" = s.root AND p."ParentId" IS NULL AND p."UserId" = :seed_user;

CREATE TEMP TABLE seed_leaf ON COMMIT DROP AS
SELECT (row_number() OVER (ORDER BY s.root_ord, s.child_ord) - 1)::int AS i, c."Id", s.item
FROM seed_category s
JOIN catalog."Category" c ON c."Name" = s.child AND c."UserId" = :seed_user;

INSERT INTO catalog."Brand" ("Id", "Name", "Slug", "Description", "CreatedAt", "UserId")
SELECT gen_random_uuid(), name, 'brand-' || lower(regexp_replace(name, '[^A-Za-z0-9]+', '-', 'g')), NULL, now(), :seed_user
FROM unnest(ARRAY[
  'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Lenovo', 'Asus', 'Acer', 'HP', 'Dell', 'Sony',
  'LG', 'Philips', 'Bosch', 'Tefal', 'Dyson', 'Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance',
  'Zara', 'H&M', 'Levis', 'IKEA', 'Lego', 'Chicco', 'Nivea', 'LOreal', 'Garmin', 'JBL'
]) AS name;

CREATE TEMP TABLE seed_brand ON COMMIT DROP AS
SELECT (row_number() OVER (ORDER BY "Name") - 1)::int AS i, "Id", "Name"
FROM catalog."Brand" WHERE "UserId" = :seed_user;

INSERT INTO catalog."ProductAttribute" ("Id", "Name", "Slug", "Unit", "SortOrder", "CreatedAt", "UserId") VALUES
  (gen_random_uuid(), 'Цвет', 'color', NULL, 1, now(), :seed_user);

-- товары: каждый 10-й без бренда, каждый 20-й скрыт с витрины, CreatedAt разнесены по минуте
INSERT INTO catalog."Product" ("Id", "Name", "Slug", "Description", "IsActive", "CreatedAt", "UserId", "CategoryId", "BrandId")
SELECT gen_random_uuid(),
       l.item || ' ' || coalesce(b."Name" || ' ', '') || 'M' || n,
       'product-' || n,
       'Демо-товар №' || n || '. ' || l.item || ' для проверки витрины и оформления заказа.',
       n % 20 <> 0,
       now() - make_interval(mins => n),
       :seed_user,
       l."Id",
       CASE WHEN n % 10 = 0 THEN NULL ELSE b."Id" END
FROM generate_series(1, :products) AS n
JOIN seed_leaf l ON l.i = n % (SELECT count(*) FROM seed_leaf)
JOIN seed_brand b ON b.i = (n / 7) % (SELECT count(*) FROM seed_brand);

-- 1–3 варианта на товар. Цена в тенге, кратна 10. Первый вариант всегда активен,
-- остальные иногда скрыты; примерно каждый 6-й вариант без остатка
INSERT INTO catalog."ProductVariant" ("Id", "Sku", "Name", "Price", "Stock", "IsActive", "CreatedAt", "ProductId")
SELECT gen_random_uuid(),
       'SKU-' || substr(p."Slug", 9) || '-' || k,
       (ARRAY['Чёрный', 'Белый', 'Серый'])[k],
       ((2000 + abs(hashtext(p."Slug")) % 600000) / 10 * 10 + (k - 1) * 5000)::numeric(18, 2),
       CASE WHEN abs(hashtext(p."Slug" || k)) % 6 = 0 THEN 0 ELSE 1 + abs(hashtext(p."Slug" || 's' || k)) % 50 END,
       k = 1 OR abs(hashtext(p."Slug" || 'a' || k)) % 10 <> 0,
       now(),
       p."Id"
FROM catalog."Product" p
CROSS JOIN LATERAL generate_series(1, 1 + abs(hashtext(p."Slug")) % 3) AS k
WHERE p."UserId" = :seed_user;

INSERT INTO catalog."VariantAttributeValue" ("Id", "Value", "ProductVariantId", "AttributeId")
SELECT gen_random_uuid(), v."Name", v."Id", a."Id"
FROM catalog."ProductVariant" v
JOIN catalog."Product" p ON p."Id" = v."ProductId" AND p."UserId" = :seed_user
CROSS JOIN (SELECT "Id" FROM catalog."ProductAttribute" WHERE "UserId" = :seed_user AND "Slug" = 'color') a;

INSERT INTO catalog."ProductImage" ("Id", "ImagePath", "Alt", "SortOrder", "IsMain", "CreatedAt", "ProductId")
SELECT gen_random_uuid(), 'https://picsum.photos/seed/' || p."Slug" || '/480/480', NULL, 0, true, now(), p."Id"
FROM catalog."Product" p
WHERE p."UserId" = :seed_user;

COMMIT;

ANALYZE catalog."Product";
ANALYZE catalog."ProductVariant";

SELECT
  (SELECT count(*) FROM catalog."Category" WHERE "UserId" = :seed_user)        AS categories,
  (SELECT count(*) FROM catalog."Brand"    WHERE "UserId" = :seed_user)        AS brands,
  (SELECT count(*) FROM catalog."Product"  WHERE "UserId" = :seed_user)        AS products,
  (SELECT count(*) FROM catalog."Product"  WHERE "UserId" = :seed_user AND "IsActive") AS active_products,
  (SELECT count(*) FROM catalog."ProductVariant" v JOIN catalog."Product" p ON p."Id" = v."ProductId" WHERE p."UserId" = :seed_user) AS variants;
