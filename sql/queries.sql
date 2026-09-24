-- ============================================================================
-- Q3: Subscriber & Usage SQL Queries
-- ============================================================================
-- Assumes the following tables exist:
--
-- subscribers (
--   id              VARCHAR(10)  PRIMARY KEY,
--   name            VARCHAR(100) NOT NULL,
--   plan            VARCHAR(20)  NOT NULL,
--   activation_date DATE         NOT NULL
-- )
--
-- usage (
--   subscriberId  VARCHAR(10)  NOT NULL,
--   callMinutes   INT          NOT NULL,
--   smsCount      INT          NOT NULL,
--   dataUsageMB   INT          NOT NULL,
--   timestamp     DATETIME     NOT NULL,
--   FOREIGN KEY (subscriberId) REFERENCES subscribers(id)
-- )
-- ============================================================================

-- Reference data already in subscribers table:
-- ID     | Name  | Plan    | Activation Date
-- SUB01  | Amir  | Basic   | 12-Jan-23
-- SUB02  | Sari  | Premium | 03-May-22
-- SUB03  | Budi  | Basic   | 20-Sep-24
-- SUB04  | Dewi  | Family  | 15-Feb-21
-- SUB05  | Rian  | Premium | 08-Aug-23
-- SUB06  | Nia   | Basic   | 30-Nov-24


-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Insert a new subscriber named Fajar, Basic plan, activated 24 January 2024
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO subscribers (id, name, plan, activation_date)
VALUES ('SUB07', 'Fajar', 'Basic', '2024-01-24');


-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Update Fajar's plan to Premium
-- ──────────────────────────────────────────────────────────────────────────────

UPDATE subscribers
SET plan = 'Premium'
WHERE name = 'Fajar';


-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Calculate total data usage (sum of dataUsageMB) for all Premium subscribers
-- ──────────────────────────────────────────────────────────────────────────────

SELECT
    s.id            AS subscriber_id,
    s.name          AS subscriber_name,
    s.plan          AS plan,
    SUM(u.dataUsageMB) AS total_data_usage_mb
FROM
    subscribers s
    INNER JOIN usage u ON s.id = u.subscriberId
WHERE
    s.plan = 'Premium'
GROUP BY
    s.id, s.name, s.plan;

-- If you want just one grand total for ALL Premium subscribers combined:
-- SELECT SUM(u.dataUsageMB) AS total_premium_data_usage_mb
-- FROM subscribers s
-- INNER JOIN usage u ON s.id = u.subscriberId
-- WHERE s.plan = 'Premium';


-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Top 3 subscribers by total data usage across all snapshots
-- ──────────────────────────────────────────────────────────────────────────────

SELECT
    s.id            AS subscriber_id,
    s.name          AS subscriber_name,
    s.plan          AS plan,
    SUM(u.dataUsageMB) AS total_data_usage_mb
FROM
    subscribers s
    INNER JOIN usage u ON s.id = u.subscriberId
GROUP BY
    s.id, s.name, s.plan
ORDER BY
    total_data_usage_mb DESC
LIMIT 3;


-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Subquery: subscribers whose average call minutes per snapshot <= 30
-- ──────────────────────────────────────────────────────────────────────────────

SELECT
    s.id   AS subscriber_id,
    s.name AS subscriber_name,
    s.plan AS plan
FROM
    subscribers s
WHERE
    s.id IN (
        SELECT
            u.subscriberId
        FROM
            usage u
        GROUP BY
            u.subscriberId
        HAVING
            AVG(u.callMinutes) <= 30
    );
