-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.update_profile_direct(user_id uuid, profile_data jsonb);

-- Create a new function to update profiles directly
CREATE OR REPLACE FUNCTION public.update_profile_direct(
  user_id uuid,
  profile_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  profile_exists boolean;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
  
  -- Log the operation
  INSERT INTO public.debug_logs (operation, user_id, data, notes)
  VALUES ('update_profile_direct', user_id, profile_data, 'Profile exists: ' || profile_exists);
  
  IF profile_exists THEN
    -- Update existing profile
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
      updated_at = COALESCE(profile_data->>'updated_at', NOW())
    WHERE id = user_id
    RETURNING to_jsonb(profiles.*) INTO result;
    
    -- Log the result
    INSERT INTO public.debug_logs (operation, user_id, data, notes)
    VALUES ('update_profile_direct', user_id, result, 'Profile updated');
    
    RETURN result;
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
      user_id,
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
      COALESCE(profile_data->>'created_at', NOW()),
      COALESCE(profile_data->>'updated_at', NOW())
    )
    RETURNING to_jsonb(profiles.*) INTO result;
    
    -- Log the result
    INSERT INTO public.debug_logs (operation, user_id, data, notes)
    VALUES ('update_profile_direct', user_id, result, 'Profile created');
    
    RETURN result;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Log the error
  INSERT INTO public.debug_logs (operation, user_id, data, notes)
  VALUES ('update_profile_direct', user_id, profile_data, 'Error: ' || SQLERRM);
  
  -- Return the error
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Create debug_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.debug_logs (
  id SERIAL PRIMARY KEY,
  operation TEXT,
  user_id UUID,
  data JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.update_profile_direct(uuid, jsonb) TO anon, authenticated, service_role;

-- Grant access to the debug_logs table
GRANT ALL ON public.debug_logs TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE debug_logs_id_seq TO anon, authenticated, service_role;
