-- Function to update avatar URL directly
CREATE OR REPLACE FUNCTION update_profile_avatar(p_user_id UUID, p_avatar_url TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO profile_exists;

  IF profile_exists THEN
    -- Update existing profile
    UPDATE profiles
    SET
      avatar = p_avatar_url,
      updated_at = NOW()
    WHERE id = p_user_id
    RETURNING to_jsonb(profiles.*) INTO result;
  ELSE
    -- Insert new profile with avatar
    INSERT INTO profiles (id, avatar, created_at, updated_at)
    VALUES (p_user_id, p_avatar_url, NOW(), NOW())
    RETURNING to_jsonb(profiles.*) INTO result;
  END IF;

  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Function to update profile safely
CREATE OR REPLACE FUNCTION update_profile_safe(p_user_id UUID, p_profile_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO profile_exists;

  IF profile_exists THEN
    -- Update existing profile
    UPDATE profiles
    SET
      name = COALESCE(p_profile_data->>'name', name),
      avatar = COALESCE(p_profile_data->>'avatar', avatar),
      country_code = COALESCE(p_profile_data->>'country_code', country_code),
      phone = COALESCE(p_profile_data->>'phone', phone),
      bio = COALESCE(p_profile_data->>'bio', bio),
      language = COALESCE(p_profile_data->>'language', language),
      website = COALESCE(p_profile_data->>'website', website),
      gender = COALESCE(p_profile_data->>'gender', gender),
      birth_date = COALESCE(p_profile_data->>'birth_date', birth_date),
      profession = COALESCE(p_profile_data->>'profession', profession),
      updated_at = NOW()
    WHERE id = p_user_id
    RETURNING to_jsonb(profiles.*) INTO result;
  ELSE
    -- Insert new profile
    INSERT INTO profiles (
      id,
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
      p_user_id,
      p_profile_data->>'name',
      p_profile_data->>'avatar',
      p_profile_data->>'country_code',
      p_profile_data->>'phone',
      p_profile_data->>'bio',
      p_profile_data->>'language',
      p_profile_data->>'website',
      p_profile_data->>'gender',
      p_profile_data->>'birth_date',
      p_profile_data->>'profession',
      NOW(),
      NOW()
    )
    RETURNING to_jsonb(profiles.*) INTO result;
  END IF;

  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Function to update profile without auth
CREATE OR REPLACE FUNCTION update_profile_no_auth(p_user_id UUID, p_profile_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO profile_exists;

  IF profile_exists THEN
    -- Update existing profile
    UPDATE profiles
    SET
      name = COALESCE(p_profile_data->>'name', name),
      avatar = COALESCE(p_profile_data->>'avatar', avatar),
      country_code = COALESCE(p_profile_data->>'country_code', country_code),
      phone = COALESCE(p_profile_data->>'phone', phone),
      bio = COALESCE(p_profile_data->>'bio', bio),
      language = COALESCE(p_profile_data->>'language', language),
      website = COALESCE(p_profile_data->>'website', website),
      gender = COALESCE(p_profile_data->>'gender', gender),
      birth_date = COALESCE(p_profile_data->>'birth_date', birth_date),
      profession = COALESCE(p_profile_data->>'profession', profession),
      email = COALESCE(p_profile_data->>'email', email),
      updated_at = NOW()
    WHERE id = p_user_id
    RETURNING to_jsonb(profiles.*) INTO result;
  ELSE
    -- Insert new profile
    INSERT INTO profiles (
      id,
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
      email,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      p_profile_data->>'name',
      p_profile_data->>'avatar',
      p_profile_data->>'country_code',
      p_profile_data->>'phone',
      p_profile_data->>'bio',
      p_profile_data->>'language',
      p_profile_data->>'website',
      p_profile_data->>'gender',
      p_profile_data->>'birth_date',
      p_profile_data->>'profession',
      p_profile_data->>'email',
      COALESCE(p_profile_data->>'created_at', NOW()),
      NOW()
    )
    RETURNING to_jsonb(profiles.*) INTO result;
  END IF;

  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
