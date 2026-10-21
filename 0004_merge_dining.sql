-- Only the retired category is merged. Safe to repeat on development or a new target.
-- The caller owns the transaction. Never run against the live Replit database.
CREATE OR REPLACE FUNCTION pg_temp.den_topics(items text[], use_slug boolean DEFAULT false)
RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
 SELECT ARRAY(
   SELECT mapped FROM (
     SELECT CASE WHEN lower(btrim(v))='dining' THEN
       CASE WHEN use_slug THEN 'food-and-wine' ELSE 'Food & Wine' END ELSE v END AS mapped,
       ord
     FROM unnest(items) WITH ORDINALITY AS x(v,ord)
   ) m WHERE mapped IS DISTINCT FROM CASE WHEN use_slug THEN 'food-and-wine' ELSE 'Food & Wine' END
     OR ord=(SELECT min(ord2) FROM unnest(items) WITH ORDINALITY AS y(v2,ord2)
       WHERE v2=CASE WHEN use_slug THEN 'food-and-wine' ELSE 'Food & Wine' END OR lower(btrim(v2))='dining')
   ORDER BY ord
 )
$$;

CREATE OR REPLACE FUNCTION pg_temp.den_topic_json(value jsonb, context text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE result jsonb; k text; v jsonb; mapped text; rewritten jsonb;
BEGIN
 IF jsonb_typeof(value)='object' THEN
   result='{}'::jsonb;
   FOR k,v IN SELECT * FROM jsonb_each(value) LOOP
     mapped=k;
     IF lower(btrim(k))='dining' AND context IN ('vertical_scores','tag_scores','targeting','topic_targeting','topics','categories') THEN
       mapped=CASE WHEN context='tag_scores' THEN 'food-and-wine' ELSE 'Food & Wine' END;
     END IF;
     rewritten=pg_temp.den_topic_json(v,k);
     IF result ? mapped AND jsonb_typeof(result->mapped)='number' AND jsonb_typeof(rewritten)='number' THEN
       rewritten=to_jsonb((result->>mapped)::numeric + (rewritten#>>'{}')::numeric);
     END IF;
     result=jsonb_set(result,ARRAY[mapped],rewritten);
   END LOOP;
   RETURN result;
 ELSIF jsonb_typeof(value)='array' THEN
   SELECT coalesce(jsonb_agg(pg_temp.den_topic_json(x,context) ORDER BY ord),'[]'::jsonb)
     INTO result FROM jsonb_array_elements(value) WITH ORDINALITY AS a(x,ord);
   IF context IN ('topics','categories','topicPreferences','followedTopics','topic_targeting') THEN
     SELECT coalesce(jsonb_agg(x ORDER BY ord),'[]'::jsonb) INTO result
       FROM jsonb_array_elements(result) WITH ORDINALITY AS a(x,ord)
       WHERE x<>'"Food & Wine"'::jsonb OR ord=(
         SELECT min(pos) FROM jsonb_array_elements(result) WITH ORDINALITY AS b(v,pos)
         WHERE b.v='"Food & Wine"'::jsonb);
   END IF;
   RETURN result;
 ELSIF jsonb_typeof(value)='string' AND lower(btrim(value#>>'{}'))='dining'
   AND context IN ('topic','category','articleTopic','topics','categories','topicPreferences','followedTopics','topic_targeting','targeting','vertical_scores','tags') THEN
   RETURN to_jsonb(CASE WHEN context='tags' THEN 'food-and-wine' ELSE 'Food & Wine' END::text);
 END IF;
 RETURN value;
END $$;

INSERT INTO categories(slug,name,sub_brand) VALUES('food-and-wine','Food & Wine','Brindis')
ON CONFLICT(slug) DO UPDATE SET sub_brand='Brindis';

DO $$
DECLARE item record;
BEGIN
 FOR item IN SELECT * FROM (VALUES
   ('articles','topic'),('bookmarks','article_topic'),('events','category'),
   ('opportunities','category'),('ad_creatives','category'),('community_proposals','category'),
   ('marketplace_listings','category')
 ) AS t(tbl,col) LOOP
   IF to_regclass('public.'||item.tbl) IS NOT NULL THEN
     EXECUTE format('UPDATE %I SET %I=$1 WHERE lower(btrim(%I))=$2',item.tbl,item.col,item.col)
       USING 'Food & Wine','dining';
   END IF;
 END LOOP;
 FOR item IN SELECT * FROM (VALUES
   ('users','topic_preferences',false),('innovators','topics',false),('articles','tags',true)
 ) AS t(tbl,col,slug) LOOP
   EXECUTE format('UPDATE %I SET %I=pg_temp.den_topics(%I,$1) WHERE EXISTS(SELECT 1 FROM unnest(%I) v WHERE lower(btrim(v))=$2)',
     item.tbl,item.col,item.col,item.col) USING item.slug,'dining';
 END LOOP;
END $$;

-- Consolidate only users who have the retired preference. OR keeps every opt-in.
CREATE TEMP TABLE den_notification_merge ON COMMIT DROP AS
SELECT user_id,(array_agg(id ORDER BY (topic='Food & Wine') DESC,id))[1] keep_id,
 bool_or(notify_stories) stories,bool_or(notify_opportunities) opportunities,bool_or(notify_events) events,max(updated_at) updated
FROM user_notification_prefs
WHERE lower(btrim(topic)) IN ('dining','food & wine','food-and-wine')
 AND user_id IN(SELECT user_id FROM user_notification_prefs WHERE lower(btrim(topic))='dining')
GROUP BY user_id;
DELETE FROM user_notification_prefs p USING den_notification_merge m
 WHERE p.user_id=m.user_id AND lower(btrim(p.topic)) IN ('dining','food & wine','food-and-wine') AND p.id<>m.keep_id;
UPDATE user_notification_prefs p SET topic='Food & Wine',notify_stories=m.stories,
 notify_opportunities=m.opportunities,notify_events=m.events,updated_at=m.updated
 FROM den_notification_merge m WHERE p.id=m.keep_id;

CREATE TEMP TABLE den_interest_merge ON COMMIT DROP AS
SELECT user_id,(array_agg(id ORDER BY (topic='Food & Wine') DESC,id))[1] keep_id,
 least(1,greatest(0,sum(score))) score,sum(interaction_count)::integer interactions,
 max(last_interacted_at) last_interaction,max(updated_at) updated
FROM user_interest_profiles WHERE lower(btrim(topic)) IN ('dining','food & wine','food-and-wine')
 AND user_id IN(SELECT user_id FROM user_interest_profiles WHERE lower(btrim(topic))='dining')
GROUP BY user_id;
DELETE FROM user_interest_profiles p USING den_interest_merge m
 WHERE p.user_id=m.user_id AND lower(btrim(p.topic)) IN ('dining','food & wine','food-and-wine') AND p.id<>m.keep_id;
UPDATE user_interest_profiles p SET topic='Food & Wine',score=m.score,interaction_count=m.interactions,
 last_interacted_at=m.last_interaction,updated_at=m.updated FROM den_interest_merge m WHERE p.id=m.keep_id;

CREATE TEMP TABLE den_follow_merge ON COMMIT DROP AS
SELECT user_id,(array_agg(id ORDER BY (target_id='food-and-wine') DESC,id))[1] keep_id,min(created_at) created
FROM follows WHERE target_type='topic' AND lower(btrim(target_id)) IN ('dining','food & wine','food-and-wine')
 AND user_id IN(SELECT user_id FROM follows WHERE target_type='topic' AND lower(btrim(target_id))='dining')
GROUP BY user_id;
DELETE FROM follows f USING den_follow_merge m WHERE f.user_id=m.user_id AND f.target_type='topic'
 AND lower(btrim(f.target_id)) IN ('dining','food & wine','food-and-wine') AND f.id<>m.keep_id;
UPDATE follows f SET target_id='food-and-wine',created_at=m.created FROM den_follow_merge m WHERE f.id=m.keep_id;

DO $$
DECLARE item record;
BEGIN
 FOR item IN SELECT * FROM (VALUES
   ('user_preference_vectors','vertical_scores'),('user_preference_vectors','tag_scores'),
   ('ad_campaigns','targeting'),('ad_inventory_slots','targeting'),('ad_placements','topic_targeting'),
   ('user_events','metadata')
 ) AS t(tbl,col) LOOP
   IF to_regclass('public.'||item.tbl) IS NOT NULL THEN
     EXECUTE format('UPDATE %I SET %I=pg_temp.den_topic_json(%I,$1) WHERE %I::text ~* $2',
       item.tbl,item.col,item.col,item.col) USING item.col,'"dining"';
   END IF;
 END LOOP;
END $$;
DELETE FROM categories WHERE lower(btrim(name))='dining' OR lower(btrim(slug))='dining';
