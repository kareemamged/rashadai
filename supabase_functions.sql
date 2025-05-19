-- First, drop the existing functions if they exist
DROP FUNCTION IF EXISTS update_profile_sql(TEXT, JSONB);
DROP FUNCTION IF EXISTS update_profile_direct(TEXT, JSONB);

-- Function to update profile directly with SQL
-- This function bypasses RLS policies and can be used to update profiles
-- even when the user is not authenticated
CREATE OR REPLACE FUNCTION update_profile_sql_v2(user_id TEXT, profile_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This means the function runs with the privileges of the user who created it
AS $$
DECLARE
  result JSONB;
  existing_profile BOOLEAN;
  uuid_id UUID;
BEGIN
  -- Convert text to UUID if possible
  BEGIN
    uuid_id := user_id::UUID;
  EXCEPTION WHEN others THEN
    -- If conversion fails, return an error
    RAISE EXCEPTION 'Invalid UUID: %', user_id;
  END;

  -- Check if the profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = uuid_id) INTO existing_profile;

  -- If the profile exists, update it
  IF existing_profile THEN
    UPDATE profiles
    SET
      name = COALESCE(profile_data->>'name', name),
      avatar = COALESCE(profile_data->>'avatar', avatar),
      country_code = COALESCE(profile_data->>'country_code', country_code),
      phone = COALESCE(profile_data->>'phone', phone),
      bio = COALESCE(profile_data->>'bio', bio),
      language = COALESCE(profile_data->>'language', language),
      website = COALESCE(profile_data->>'website', website),
      gender = COALESCE(profile_data->>'gender', gender),
      birth_date = COALESCE(profile_data->>'birth_date', birth_date),
      profession = COALESCE(profile_data->>'profession', profession),
      updated_at = COALESCE(profile_data->>'updated_at'::TIMESTAMP, NOW())
    WHERE id = uuid_id
    RETURNING to_jsonb(profiles.*) INTO result;
  -- If the profile doesn't exist, insert it
  ELSE
    INSERT INTO profiles (
      id,
      email,
      name,
      avatar,
      country_code,
      phone,
      bio,
      language,
      website,
      gender,
      birth_date,
      profession,
      created_at,
      updated_at
    )
    VALUES (
      uuid_id,
      profile_data->>'email',
      profile_data->>'name',
      profile_data->>'avatar',
      profile_data->>'country_code',
      profile_data->>'phone',
      profile_data->>'bio',
      profile_data->>'language',
      profile_data->>'website',
      profile_data->>'gender',
      profile_data->>'birth_date',
      profile_data->>'profession',
      COALESCE((profile_data->>'created_at')::TIMESTAMP, NOW()),
      COALESCE((profile_data->>'updated_at')::TIMESTAMP, NOW())
    )
    RETURNING to_jsonb(profiles.*) INTO result;
  END IF;

  RETURN result;
END;
$$;

-- Function to update profile directly with RPC
-- This is a wrapper around the update_profile_sql_v2 function
CREATE OR REPLACE FUNCTION update_profile_direct_v2(p_user_id TEXT, p_profile_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN update_profile_sql_v2(p_user_id, p_profile_data);
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION update_profile_sql_v2 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_profile_direct_v2 TO anon, authenticated;
