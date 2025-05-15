-- Function to update a user profile safely, bypassing RLS policies
-- This function should be executed by the server role
CREATE OR REPLACE FUNCTION public.update_profile_safe_v2(
  p_user_id UUID,
  p_profile_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This function will execute with the privileges of the user who created it
SET search_path = public
AS $$
DECLARE
  v_profile JSONB;
  v_existing_profile JSONB;
  v_result JSONB;
  v_updated_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set updated_at to current timestamp
  v_updated_at := NOW();
  
  -- Check if profile exists
  SELECT row_to_json(p)::JSONB INTO v_existing_profile
  FROM profiles p
  WHERE id = p_user_id;
  
  IF v_existing_profile IS NULL THEN
    -- Profile doesn't exist, create it
    v_profile := jsonb_build_object(
      'id', p_user_id,
      'created_at', v_updated_at,
      'updated_at', v_updated_at
    ) || p_profile_data;
    
    -- Insert the new profile
    INSERT INTO profiles
    SELECT * FROM jsonb_populate_record(NULL::profiles, v_profile)
    RETURNING row_to_json(profiles)::JSONB INTO v_result;
    
    RETURN v_result;
  ELSE
    -- Profile exists, update it
    -- Preserve created_at from existing profile
    v_profile := v_existing_profile || p_profile_data || jsonb_build_object('updated_at', v_updated_at);
    
    -- Remove id from the update data to avoid "cannot update identity column" error
    v_profile := v_profile - 'id';
    
    -- Update the profile
    UPDATE profiles
    SET (name, avatar, country_code, phone, bio, language, website, gender, birth_date, profession, updated_at) = 
    (
      COALESCE((v_profile->>'name')::TEXT, name),
      COALESCE((v_profile->>'avatar')::TEXT, avatar),
      COALESCE((v_profile->>'country_code')::TEXT, country_code),
      COALESCE((v_profile->>'phone')::TEXT, phone),
      COALESCE((v_profile->>'bio')::TEXT, bio),
      COALESCE((v_profile->>'language')::TEXT, language),
      COALESCE((v_profile->>'website')::TEXT, website),
      COALESCE((v_profile->>'gender')::TEXT, gender),
      COALESCE((v_profile->>'birth_date')::TEXT, birth_date),
      COALESCE((v_profile->>'profession')::TEXT, profession),
      v_updated_at
    )
    WHERE id = p_user_id
    RETURNING row_to_json(profiles)::JSONB INTO v_result;
    
    RETURN v_result;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'error_detail', SQLSTATE,
    'user_id', p_user_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_profile_safe_v2(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_profile_safe_v2(UUID, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.update_profile_safe_v2(UUID, JSONB) TO service_role;

-- Function to get a user profile safely, bypassing RLS policies
CREATE OR REPLACE FUNCTION public.get_profile_safe(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Get the profile
  SELECT row_to_json(p)::JSONB INTO v_result
  FROM profiles p
  WHERE id = p_user_id;
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'error_detail', SQLSTATE,
    'user_id', p_user_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_profile_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_safe(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_profile_safe(UUID) TO service_role;
